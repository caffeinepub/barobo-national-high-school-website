import { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import {
  useGetBanners,
  useCreateBannerFromBlob,
  useCreateBannerFromURL,
  useDeleteBanner,
} from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, Upload, Trash2, Edit, ExternalLink, Check, X } from 'lucide-react';
import { convertToDirectImageUrl } from '../lib/urlConverter';
import { validateProxiedImageUrl } from '../lib/imageProxy';
import { uploadFile, uploadFromURL } from '../lib/externalBlobUpload';
import { getUploadErrorMessage, logUploadError } from '../lib/uploadErrorMessage';
import { toast } from 'sonner';

export default function BannerManager() {
  const { actor } = useActor();
  const { data: banners, isLoading } = useGetBanners();
  const createBannerFromBlob = useCreateBannerFromBlob();
  const createBannerFromURL = useCreateBannerFromURL();
  const deleteBanner = useDeleteBanner();

  const [uploadType, setUploadType] = useState<'device' | 'url'>('device');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (uploadType === 'url' && externalUrl.trim()) {
      setIsValidating(true);
      setValidationError(null);
      setPreviewUrl(null);

      timeoutId = setTimeout(async () => {
        try {
          const convertedUrl = convertToDirectImageUrl(externalUrl.trim());

          if (!actor) {
            setValidationError('Actor not available');
            setIsValidating(false);
            return;
          }

          const result = await validateProxiedImageUrl(convertedUrl, actor);
          if (result.valid && result.proxyUrl) {
            setPreviewUrl(result.proxyUrl);
            setValidationError(null);
          } else {
            setValidationError(result.error || 'Invalid or inaccessible URL');
            setPreviewUrl(null);
          }
        } catch (error: any) {
          setValidationError(error.message || 'Invalid or inaccessible URL');
          setPreviewUrl(null);
        } finally {
          setIsValidating(false);
        }
      }, 300);
    } else {
      setPreviewUrl(null);
      setValidationError(null);
      setIsValidating(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [externalUrl, uploadType, actor]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploadProgress(0);

      if (uploadType === 'device' && selectedFile) {
        const blob = await uploadFile(selectedFile, {
          onProgress: (percentage) => setUploadProgress(percentage),
          onError: (error) => logUploadError(error, 'Banner Upload'),
        });

        await createBannerFromBlob.mutateAsync({
          file: blob,
          title,
          description,
          isActive: true,
          isAnimated: selectedFile.type === 'image/gif',
        });

        toast.success('Banner added successfully!');
      } else if (uploadType === 'url' && externalUrl.trim()) {
        if (!previewUrl) {
          toast.error('Please wait for URL validation to complete');
          return;
        }

        const convertedUrl = convertToDirectImageUrl(externalUrl.trim());

        await createBannerFromURL.mutateAsync({
          url: convertedUrl,
          title,
          description,
          isActive: true,
        });

        toast.success('Banner added successfully!');
      }

      setSelectedFile(null);
      setExternalUrl('');
      setTitle('');
      setDescription('');
      setPreviewUrl(null);
      setValidationError(null);
      setUploadProgress(0);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      logUploadError(error, 'Banner Management');
      toast.error(getUploadErrorMessage(error));
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner.mutateAsync(id);
        toast.success('Banner deleted successfully!');
      } catch (error: any) {
        logUploadError(error, 'Banner Delete');
        toast.error(getUploadErrorMessage(error));
      }
    }
  };

  const handleCancelEdit = () => {
    setSelectedFile(null);
    setExternalUrl('');
    setTitle('');
    setDescription('');
    setPreviewUrl(null);
    setValidationError(null);
    setUploadProgress(0);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Upload Type</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  type="button"
                  variant={uploadType === 'device' ? 'default' : 'outline'}
                  onClick={() => {
                    setUploadType('device');
                    setExternalUrl('');
                    setPreviewUrl(null);
                    setValidationError(null);
                  }}
                  className={uploadType === 'device' ? 'bg-maroon hover:bg-maroon/90' : ''}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Device Upload
                </Button>
                <Button
                  type="button"
                  variant={uploadType === 'url' ? 'default' : 'outline'}
                  onClick={() => {
                    setUploadType('url');
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className={uploadType === 'url' ? 'bg-maroon hover:bg-maroon/90' : ''}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  External Link
                </Button>
              </div>
            </div>

            {uploadType === 'device' ? (
              <div>
                <Label htmlFor="file">Select Banner Image (1920×600 px recommended)</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="url">External Image URL</Label>
                <Input
                  id="url"
                  type="text"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="Paste Google Drive, OneDrive, Dropbox, or Google Photos link..."
                  className="mt-1"
                />
                {isValidating && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </p>
                )}
                {validationError && (
                  <p className="text-sm text-red-600 mt-2">{validationError}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter banner title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter banner description"
                className="mt-1"
                rows={3}
              />
            </div>

            {previewUrl && (
              <div>
                <Label>Preview (1920×600 px)</Label>
                <div className="mt-2 border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto object-cover aspect-[1920/600]"
                  />
                </div>
              </div>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                      background: 'linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)',
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={
                  createBannerFromBlob.isPending ||
                  createBannerFromURL.isPending ||
                  isValidating ||
                  (uploadType === 'url' && !previewUrl) ||
                  (uploadProgress > 0 && uploadProgress < 100)
                }
                className="bg-maroon hover:bg-maroon/90"
              >
                {createBannerFromBlob.isPending || createBannerFromURL.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Banner'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {!banners || banners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No banners yet. Add your first banner above!</p>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => {
                const imageUrl =
                  banner.image.__kind__ === 'url'
                    ? banner.image.url
                    : banner.image.file.file.getDirectURL();

                return (
                  <Card key={Number(banner.id)} className="overflow-hidden">
                    <div className="aspect-[1920/600] relative">
                      <img
                        src={`${imageUrl}?t=${Date.now()}`}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      {banner.isActive && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Active
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{banner.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{banner.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(banner.id)}
                          disabled={deleteBanner.isPending}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
