import { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Loader2, Trash2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useCreateBannerFromBlob, useCreateBannerFromURL, useGetBanners, useDeleteBanner, useGetBannerVersion, useGetCurrentBanner } from '@/hooks/useQueries';
import type { BannerImage } from '@/backend';
import { ExternalBlob } from '@/backend';
import { toast } from 'sonner';
import { convertToDirectImageUrl, detectCloudProvider, isLikelyImageUrl, getProviderName } from '@/lib/urlConverter';
import { getProxiedImageUrl, validateProxiedImageUrl, shouldProxyUrl } from '@/lib/imageProxy';
import { useActor } from '@/hooks/useActor';

export default function BannerManager() {
  const [file, setFile] = useState<File | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnimated, setIsAnimated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);
  const [lastValidatedUrl, setLastValidatedUrl] = useState<string>('');
  const [validatedDirectUrl, setValidatedDirectUrl] = useState<string | null>(null);

  const { data: banners, isLoading: bannersLoading, error: bannersError } = useGetBanners();
  const { data: currentBanner } = useGetCurrentBanner();
  const { data: bannerVersion } = useGetBannerVersion();
  const { actor } = useActor();
  const createBannerFromBlob = useCreateBannerFromBlob();
  const createBannerFromURL = useCreateBannerFromURL();
  const deleteBanner = useDeleteBanner();

  const isUploading = createBannerFromBlob.isPending || createBannerFromURL.isPending;

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Auto-hide error message after 10 seconds
  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => {
        setUploadError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  // Auto-validate URL when pasted with minimal debounce
  useEffect(() => {
    const trimmedUrl = driveLink.trim();
    
    if (trimmedUrl && trimmedUrl !== lastValidatedUrl && !isValidatingUrl) {
      const timer = setTimeout(() => {
        handleValidateAndPreviewUrl();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [driveLink, lastValidatedUrl, isValidatingUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setIsAnimated(selectedFile.type === 'image/gif');
        setShowSuccess(false);
        setUploadError(null);
      } else {
        toast.error('Invalid file type', {
          description: 'Please select a valid image file (JPG, PNG, or GIF)',
        });
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    setIsAnimated(false);
    setDriveLink('');
    setUrlPreview(null);
    setConversionMessage(null);
    setLastValidatedUrl('');
    setValidatedDirectUrl(null);
    
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('No file selected', {
        description: 'Please select a file to upload',
      });
      return;
    }

    setUploadProgress(0);
    setShowSuccess(false);
    setUploadError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await createBannerFromBlob.mutateAsync({
        file: blob,
        title: title || file.name,
        description: description || '',
        isActive: true,
        isAnimated,
      });

      setShowSuccess(true);
      toast.success('Banner uploaded successfully!', {
        description: `The new banner${isAnimated ? ' (animated GIF)' : ''} is now active and displayed above the navbar.`,
        duration: 5000,
      });
      
      setTimeout(() => {
        resetForm();
      }, 500);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload banner. Please try again.';
      setUploadError(errorMessage);
      toast.error('Upload failed', {
        description: errorMessage,
        duration: 7000,
      });
      setUploadProgress(0);
    }
  };

  const handleValidateAndPreviewUrl = async () => {
    const trimmedUrl = driveLink.trim();
    
    if (!trimmedUrl) {
      setUploadError('Please enter an image URL');
      return;
    }

    setIsValidatingUrl(true);
    setUploadError(null);
    setUrlPreview(null);
    setConversionMessage(null);
    setValidatedDirectUrl(null);
    setLastValidatedUrl(trimmedUrl);

    try {
      if (!isLikelyImageUrl(trimmedUrl)) {
        setUploadError('The URL does not appear to be an image. Please provide a direct link to an image file (JPG, PNG, GIF) or a sharing link from Google Drive, OneDrive, or Dropbox.');
        setIsValidatingUrl(false);
        return;
      }

      const provider = detectCloudProvider(trimmedUrl);
      const providerName = getProviderName(provider);
      const directUrl = convertToDirectImageUrl(trimmedUrl);
      
      // Show conversion message if URL was converted
      if (directUrl !== trimmedUrl && provider !== 'other') {
        setConversionMessage(`${providerName} link detected and converted`);
      }

      // Validate through backend proxy for cloud storage URLs
      const validation = await validateProxiedImageUrl(directUrl, actor);
      
      if (!validation.valid) {
        setUploadError(validation.error || 'Failed to load image. Please check sharing permissions.');
        setIsValidatingUrl(false);
        return;
      }

      // Use proxy URL if available, otherwise use direct URL
      const previewUrl = validation.proxyUrl || directUrl;
      setUrlPreview(previewUrl);
      setValidatedDirectUrl(directUrl);
      
      // Show success toast for cloud storage links
      if (provider !== 'other') {
        toast.success('Link validated successfully', {
          description: `${providerName} image is accessible and ready to upload`,
          duration: 2000,
        });
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      setUploadError('Failed to validate image URL. Please check the URL and try again.');
    } finally {
      setIsValidatingUrl(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    if (pastedText.trim()) {
      setUrlPreview(null);
      setValidatedDirectUrl(null);
      setUploadError(null);
      setConversionMessage(null);
    }
  };

  const handleDriveLinkUpload = async () => {
    const trimmedUrl = driveLink.trim();
    
    if (!trimmedUrl) {
      toast.error('No link provided', {
        description: 'Please enter an image URL from Google Drive, OneDrive, or Dropbox',
      });
      return;
    }

    setShowSuccess(false);
    setUploadError(null);

    try {
      let urlToUse = validatedDirectUrl;
      
      if (!urlToUse) {
        if (!isLikelyImageUrl(trimmedUrl)) {
          setUploadError('The URL does not appear to be an image. Please provide a direct link to an image file (JPG, PNG, GIF) or a sharing link from Google Drive, OneDrive, or Dropbox.');
          return;
        }

        const directUrl = convertToDirectImageUrl(trimmedUrl);
        const validation = await validateProxiedImageUrl(directUrl, actor);
        
        if (!validation.valid) {
          setUploadError(validation.error || 'Failed to load image. Please check sharing permissions.');
          return;
        }
        
        urlToUse = directUrl;
      }

      const provider = detectCloudProvider(trimmedUrl);
      const providerName = getProviderName(provider);

      await createBannerFromURL.mutateAsync({
        url: urlToUse,
        title: title || `Banner from ${providerName}`,
        description: description || '',
        isActive: true,
      });

      setShowSuccess(true);
      toast.success('Banner added successfully!', {
        description: `The new banner from ${providerName} is now active and displayed above the navbar.`,
        duration: 5000,
      });
      
      setTimeout(() => {
        resetForm();
      }, 500);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to add banner from link. Please check the URL and ensure the image is publicly accessible.';
      setUploadError(errorMessage);
      toast.error('Upload failed', {
        description: errorMessage,
        duration: 7000,
      });
    }
  };

  const handleDeleteBanner = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBanner.mutateAsync(id);
      toast.success('Banner deleted successfully', {
        description: 'The banner has been removed from the system.',
        duration: 4000,
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Delete failed', {
        description: error.message || 'Failed to delete banner. Please try again.',
        duration: 7000,
      });
    }
  };

  const getBannerImageUrl = (banner: BannerImage): string => {
    try {
      if (banner.image.__kind__ === 'file' && banner.image.file) {
        return banner.image.file.file.getDirectURL();
      } else if (banner.image.__kind__ === 'url' && banner.image.url) {
        return getProxiedImageUrl(banner.image.url);
      }
    } catch (err) {
      console.error('Error getting banner URL:', err);
    }
    return '/assets/generated/welcome-banner-optimized.dim_1133x566.jpg';
  };

  const isBannerAnimated = (banner: BannerImage): boolean => {
    if (banner.image.__kind__ === 'file' && banner.image.file) {
      return banner.image.file.isAnimated;
    } else if (banner.image.__kind__ === 'url' && banner.image.url) {
      return banner.image.url.toLowerCase().includes('.gif');
    }
    return false;
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Banner Management</CardTitle>
          <CardDescription>
            Upload a new banner image (JPG, PNG, or animated GIF) or paste an external link from Google Drive, OneDrive, or Dropbox. External links are validated through a secure backend proxy. Images automatically adjust to fill the banner area while maintaining aspect ratio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentBanner && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Current Active Banner (Live Preview)</h3>
              <Card className="border-primary">
                <CardContent className="p-2 sm:p-4">
                  <div className="relative">
                    <div className="relative w-full overflow-hidden rounded-md">
                      <div style={{ paddingBottom: '31.25%' }} className="relative">
                        <img
                          src={`${getBannerImageUrl(currentBanner)}${getBannerImageUrl(currentBanner).includes('?') ? '&' : '?'}v=${currentBanner.timestamp.toString()}-${bannerVersion?.toString() || '0'}`}
                          alt={currentBanner.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/assets/generated/welcome-banner-optimized.dim_1133x566.jpg';
                          }}
                        />
                        {isBannerAnimated(currentBanner) && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                            GIF
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-medium text-sm sm:text-base">{currentBanner.title}</p>
                    {currentBanner.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground">{currentBanner.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="text-xs sm:text-sm">
                <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">File Upload</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="drive" className="text-xs sm:text-sm">
                <LinkIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">External Link</span>
                <span className="sm:hidden">Link</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              {showSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-xs sm:text-sm">
                    Banner uploaded successfully! The new banner is now displayed above the navbar.
                  </AlertDescription>
                </Alert>
              )}

              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
                    {uploadError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs sm:text-sm">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Banner title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs sm:text-sm">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Banner description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isUploading}
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file" className="text-xs sm:text-sm">Select Image (JPG, PNG, or GIF)</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="text-xs sm:text-sm"
                />
                {file && (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    {isAnimated && (
                      <p className="text-xs sm:text-sm font-medium text-primary">
                        ✓ Animated GIF detected - animation will be preserved
                      </p>
                    )}
                  </div>
                )}
              </div>

              {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="font-medium">Uploading banner...</span>
                    <span className="text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:via-purple-500 [&>div]:to-pink-500" />
                </div>
              )}

              <Button
                onClick={handleFileUpload}
                disabled={!file || isUploading}
                className="w-full text-xs sm:text-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Upload Banner
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="drive" className="space-y-4">
              {showSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-xs sm:text-sm">
                    Banner added successfully! The new banner is now displayed above the navbar.
                  </AlertDescription>
                </Alert>
              )}

              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
                    {uploadError}
                  </AlertDescription>
                </Alert>
              )}

              {conversionMessage && !uploadError && !isValidatingUrl && (
                <Alert className="bg-blue-50 border-blue-200">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                    {conversionMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="drive-title" className="text-xs sm:text-sm">Title (Optional)</Label>
                <Input
                  id="drive-title"
                  placeholder="Banner title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drive-description" className="text-xs sm:text-sm">Description (Optional)</Label>
                <Input
                  id="drive-description"
                  placeholder="Banner description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isUploading}
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drive-link" className="text-xs sm:text-sm">Image URL (Google Drive, OneDrive, Dropbox)</Label>
                <Input
                  id="drive-link"
                  placeholder="Paste your sharing link here..."
                  value={driveLink}
                  onChange={(e) => {
                    setDriveLink(e.target.value);
                    setUrlPreview(null);
                    setUploadError(null);
                    setConversionMessage(null);
                    setValidatedDirectUrl(null);
                  }}
                  onPaste={handlePaste}
                  disabled={isUploading || isValidatingUrl}
                  className="text-xs sm:text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the shareable link from Google Drive, OneDrive, or Dropbox. The system will automatically validate through a secure backend proxy and show an instant preview below.
                </p>
              </div>

              {isValidatingUrl && (
                <div className="flex items-center justify-center py-4 border-2 border-dashed rounded-lg bg-muted/30">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary mr-2" />
                  <span className="text-xs sm:text-sm font-medium">Validating link...</span>
                </div>
              )}

              {urlPreview && validatedDirectUrl && !isValidatingUrl && (
                <div className="rounded-lg border-2 border-green-200 p-3 sm:p-4 bg-green-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-semibold text-green-700">Link validated successfully! Preview below:</p>
                  </div>
                  <div className="relative w-full overflow-hidden rounded-md border-2 border-green-300">
                    <div style={{ paddingBottom: '31.25%' }} className="relative">
                      <img
                        src={urlPreview}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={() => {
                          setUploadError('Preview failed to load. The image may not be publicly accessible.');
                          setUrlPreview(null);
                          setValidatedDirectUrl(null);
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-green-700 mt-2 font-medium">
                    ✓ This image will appear in the banner above the navbar after you click "Add Banner from Link"
                  </p>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                    <span className="ml-2 text-xs sm:text-sm font-medium">Adding banner...</span>
                  </div>
                  <Progress value={50} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:via-blue-500 [&>div]:to-purple-500 [&>div]:animate-pulse" />
                </div>
              )}

              <Button
                onClick={handleDriveLinkUpload}
                disabled={!driveLink.trim() || isUploading || isValidatingUrl}
                className="w-full text-xs sm:text-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Add Banner from Link
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <h3 className="text-base sm:text-lg font-semibold mb-4">All Uploaded Banners</h3>
            {bannersLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">Loading banners...</p>
              </div>
            ) : bannersError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  Failed to load banners. Please refresh the page to try again.
                </AlertDescription>
              </Alert>
            ) : banners && banners.length > 0 ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription className="text-xs sm:text-sm">
                    The most recent banner (shown first) is currently active and displayed above the navbar on all pages.
                  </AlertDescription>
                </Alert>
                <div className="grid gap-4 sm:grid-cols-2">
                  {banners.map((banner) => {
                    const imageUrl = getBannerImageUrl(banner);
                    const cacheBustingUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${banner.timestamp.toString()}-${bannerVersion?.toString() || '0'}`;
                    const isCurrentBanner = currentBanner?.id === banner.id;
                    
                    return (
                      <Card key={banner.id.toString()} className={isCurrentBanner ? 'border-primary' : ''}>
                        <CardContent className="p-3 sm:p-4">
                          <div className="relative">
                            <img
                              src={cacheBustingUrl}
                              alt={banner.title}
                              className="w-full h-24 sm:h-32 object-cover rounded-md mb-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/assets/generated/welcome-banner-optimized.dim_1133x566.jpg';
                              }}
                            />
                            {isCurrentBanner && (
                              <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                                Active
                              </div>
                            )}
                            {isBannerAnimated(banner) && (
                              <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-semibold" style={{ marginLeft: isCurrentBanner ? '60px' : '0' }}>
                                GIF
                              </div>
                            )}
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => handleDeleteBanner(banner.id)}
                              disabled={deleteBanner.isPending}
                            >
                              {deleteBanner.isPending ? (
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-start gap-2">
                            {banner.image.__kind__ === 'url' ? (
                              <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-xs sm:text-sm">{banner.title}</p>
                              {banner.description && (
                                <p className="text-xs text-muted-foreground truncate">{banner.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {banner.image.__kind__ === 'url' ? 'External Link' : 'Uploaded File'}
                                {isBannerAnimated(banner) && ' • Animated GIF'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  No custom banners uploaded yet. The default banner is currently displayed.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
