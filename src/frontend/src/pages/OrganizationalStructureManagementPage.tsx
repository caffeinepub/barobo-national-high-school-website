import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetOrganizationalStructure,
  useUpdateOrganizationalStructureTitleBackground,
  useRemoveOrganizationalStructureTitleBackground,
  useUpdateOrganizationalStructureStaticImage,
  useRemoveOrganizationalStructureStaticImage,
} from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Upload, ExternalLink, ArrowLeft, AlertCircle, Trash2 } from 'lucide-react';
import { convertToDirectImageUrl } from '../lib/urlConverter';
import { validateProxiedImageUrl } from '../lib/imageProxy';
import { uploadFile, uploadFromURL } from '../lib/externalBlobUpload';
import { getUploadErrorMessage, logUploadError } from '../lib/uploadErrorMessage';
import { toast } from 'sonner';

export default function OrganizationalStructureManagementPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { data: orgStructure, isLoading, error } = useGetOrganizationalStructure();
  const setTitleBackgroundMutation = useUpdateOrganizationalStructureTitleBackground();
  const removeTitleBackgroundMutation = useRemoveOrganizationalStructureTitleBackground();
  const setStaticImageMutation = useUpdateOrganizationalStructureStaticImage();
  const removeStaticImageMutation = useRemoveOrganizationalStructureStaticImage();

  const [titleUploadType, setTitleUploadType] = useState<'device' | 'url'>('device');
  const [titleFile, setTitleFile] = useState<File | null>(null);
  const [titleUrl, setTitleUrl] = useState('');
  const [titlePreviewUrl, setTitlePreviewUrl] = useState<string | null>(null);
  const [titleValidating, setTitleValidating] = useState(false);
  const [titleValidationError, setTitleValidationError] = useState<string | null>(null);
  const [titleUploadProgress, setTitleUploadProgress] = useState<number>(0);
  const [titleAutoSaveTimeout, setTitleAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const [staticUploadType, setStaticUploadType] = useState<'device' | 'url'>('device');
  const [staticFile, setStaticFile] = useState<File | null>(null);
  const [staticUrl, setStaticUrl] = useState('');
  const [staticPreviewUrl, setStaticPreviewUrl] = useState<string | null>(null);
  const [staticValidating, setStaticValidating] = useState(false);
  const [staticValidationError, setStaticValidationError] = useState<string | null>(null);
  const [staticUploadProgress, setStaticUploadProgress] = useState<number>(0);
  const [staticAutoSaveTimeout, setStaticAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  useEffect(() => {
    if (orgStructure) {
      if (orgStructure.titleBackground) {
        setTitlePreviewUrl(orgStructure.titleBackground.getDirectURL());
      }
      if (orgStructure.staticImage) {
        setStaticPreviewUrl(orgStructure.staticImage.getDirectURL());
      }
    }
  }, [orgStructure]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (titleUploadType === 'url' && titleUrl.trim()) {
      setTitleValidating(true);
      setTitleValidationError(null);
      setTitlePreviewUrl(null);

      timeoutId = setTimeout(async () => {
        try {
          const convertedUrl = convertToDirectImageUrl(titleUrl.trim());

          if (!actor) {
            setTitleValidationError('Actor not available');
            setTitleValidating(false);
            return;
          }

          const result = await validateProxiedImageUrl(convertedUrl, actor);
          if (result.valid && result.proxyUrl) {
            setTitlePreviewUrl(result.proxyUrl);
            setTitleValidationError(null);

            if (titleAutoSaveTimeout) {
              clearTimeout(titleAutoSaveTimeout);
            }

            const saveTimeout = setTimeout(async () => {
              try {
                const blob = uploadFromURL(convertedUrl);
                await setTitleBackgroundMutation.mutateAsync(blob);
                toast.success('Title background auto-saved successfully!');
              } catch (error: any) {
                logUploadError(error, 'Org Structure Title Background Auto-save');
                toast.error(getUploadErrorMessage(error));
              }
            }, 2000);

            setTitleAutoSaveTimeout(saveTimeout);
          } else {
            setTitleValidationError(result.error || 'Invalid or inaccessible URL');
            setTitlePreviewUrl(null);
          }
        } catch (error: any) {
          setTitleValidationError(error.message || 'Invalid or inaccessible URL');
          setTitlePreviewUrl(null);
        } finally {
          setTitleValidating(false);
        }
      }, 300);
    } else {
      setTitlePreviewUrl(null);
      setTitleValidationError(null);
      setTitleValidating(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [titleUrl, titleUploadType, actor]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (staticUploadType === 'url' && staticUrl.trim()) {
      setStaticValidating(true);
      setStaticValidationError(null);
      setStaticPreviewUrl(null);

      timeoutId = setTimeout(async () => {
        try {
          const convertedUrl = convertToDirectImageUrl(staticUrl.trim());

          if (!actor) {
            setStaticValidationError('Actor not available');
            setStaticValidating(false);
            return;
          }

          const result = await validateProxiedImageUrl(convertedUrl, actor);
          if (result.valid && result.proxyUrl) {
            setStaticPreviewUrl(result.proxyUrl);
            setStaticValidationError(null);

            if (staticAutoSaveTimeout) {
              clearTimeout(staticAutoSaveTimeout);
            }

            const saveTimeout = setTimeout(async () => {
              try {
                const blob = uploadFromURL(convertedUrl);
                await setStaticImageMutation.mutateAsync(blob);
                toast.success('Static image auto-saved successfully!');
              } catch (error: any) {
                logUploadError(error, 'Org Structure Static Image Auto-save');
                toast.error(getUploadErrorMessage(error));
              }
            }, 2000);

            setStaticAutoSaveTimeout(saveTimeout);
          } else {
            setStaticValidationError(result.error || 'Invalid or inaccessible URL');
            setStaticPreviewUrl(null);
          }
        } catch (error: any) {
          setStaticValidationError(error.message || 'Invalid or inaccessible URL');
          setStaticPreviewUrl(null);
        } finally {
          setStaticValidating(false);
        }
      }, 300);
    } else {
      setStaticPreviewUrl(null);
      setStaticValidationError(null);
      setStaticValidating(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [staticUrl, staticUploadType, actor]);

  const handleTitleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setTitleFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTitlePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (titleAutoSaveTimeout) {
        clearTimeout(titleAutoSaveTimeout);
      }

      const saveTimeout = setTimeout(async () => {
        try {
          setTitleUploadProgress(0);
          const blob = await uploadFile(file, {
            onProgress: (percentage) => setTitleUploadProgress(percentage),
            onError: (error) => logUploadError(error, 'Org Structure Title Background Upload'),
          });

          await setTitleBackgroundMutation.mutateAsync(blob);
          toast.success('Title background auto-saved successfully!');
          setTitleUploadProgress(0);
        } catch (error: any) {
          logUploadError(error, 'Org Structure Title Background Auto-save');
          toast.error(getUploadErrorMessage(error));
          setTitleUploadProgress(0);
        }
      }, 2000);

      setTitleAutoSaveTimeout(saveTimeout);
    }
  };

  const handleStaticFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setStaticFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStaticPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (staticAutoSaveTimeout) {
        clearTimeout(staticAutoSaveTimeout);
      }

      const saveTimeout = setTimeout(async () => {
        try {
          setStaticUploadProgress(0);
          const blob = await uploadFile(file, {
            onProgress: (percentage) => setStaticUploadProgress(percentage),
            onError: (error) => logUploadError(error, 'Org Structure Static Image Upload'),
          });

          await setStaticImageMutation.mutateAsync(blob);
          toast.success('Static image auto-saved successfully!');
          setStaticUploadProgress(0);
        } catch (error: any) {
          logUploadError(error, 'Org Structure Static Image Auto-save');
          toast.error(getUploadErrorMessage(error));
          setStaticUploadProgress(0);
        }
      }, 2000);

      setStaticAutoSaveTimeout(saveTimeout);
    }
  };

  const handleRemoveTitleBackground = async () => {
    if (window.confirm('Are you sure you want to remove the title background image?')) {
      try {
        await removeTitleBackgroundMutation.mutateAsync();
        setTitleFile(null);
        setTitleUrl('');
        setTitlePreviewUrl(null);
        toast.success('Title background removed successfully!');
      } catch (error: any) {
        logUploadError(error, 'Org Structure Title Background Remove');
        toast.error(getUploadErrorMessage(error));
      }
    }
  };

  const handleRemoveStaticImage = async () => {
    if (window.confirm('Are you sure you want to remove the static image?')) {
      try {
        await removeStaticImageMutation.mutateAsync();
        setStaticFile(null);
        setStaticUrl('');
        setStaticPreviewUrl(null);
        toast.success('Static image removed successfully!');
      } catch (error: any) {
        logUploadError(error, 'Org Structure Static Image Remove');
        toast.error(getUploadErrorMessage(error));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          onClick={() => navigate({ to: '/admin/dashboard' })}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-maroon">Organizational Structure Management</h1>
        <p className="text-gray-600 mt-2">
          Manage images for the Organizational Structure page (auto-saves after selection)
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load organizational structure. Please try again later.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="title" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="title">Title Background</TabsTrigger>
          <TabsTrigger value="static">Static Image (1920×800 px)</TabsTrigger>
        </TabsList>

        <TabsContent value="title">
          <Card>
            <CardHeader>
              <CardTitle>Title Background Image</CardTitle>
              <CardDescription>
                Upload or link to a background image for the page title section (auto-saves after selection)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Upload Type</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    type="button"
                    variant={titleUploadType === 'device' ? 'default' : 'outline'}
                    onClick={() => {
                      setTitleUploadType('device');
                      setTitleUrl('');
                      setTitlePreviewUrl(null);
                      setTitleValidationError(null);
                    }}
                    className={titleUploadType === 'device' ? 'bg-maroon hover:bg-maroon/90' : ''}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Device Upload
                  </Button>
                  <Button
                    type="button"
                    variant={titleUploadType === 'url' ? 'default' : 'outline'}
                    onClick={() => {
                      setTitleUploadType('url');
                      setTitleFile(null);
                      setTitlePreviewUrl(null);
                    }}
                    className={titleUploadType === 'url' ? 'bg-maroon hover:bg-maroon/90' : ''}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    External Link
                  </Button>
                </div>
              </div>

              {titleUploadType === 'device' ? (
                <div>
                  <Label htmlFor="titleFile">Select Image File</Label>
                  <Input
                    id="titleFile"
                    type="file"
                    accept="image/*"
                    onChange={handleTitleFileChange}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-saves 2 seconds after file selection
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="titleUrl">External Image URL</Label>
                  <Input
                    id="titleUrl"
                    type="text"
                    value={titleUrl}
                    onChange={(e) => setTitleUrl(e.target.value)}
                    placeholder="Paste Google Drive, OneDrive, Dropbox, or direct image link..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-saves 2 seconds after validation completes
                  </p>
                  {titleValidating && (
                    <p className="text-sm text-blue-600 mt-2 flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </p>
                  )}
                  {titleValidationError && (
                    <p className="text-sm text-red-600 mt-2">{titleValidationError}</p>
                  )}
                  {titleUrl && !titleValidating && !titleValidationError && titlePreviewUrl && (
                    <p className="text-sm text-green-600 mt-2">✓ Valid image URL - will auto-save in 2 seconds</p>
                  )}
                </div>
              )}

              {titleUploadProgress > 0 && titleUploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{titleUploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${titleUploadProgress}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)',
                      }}
                    />
                  </div>
                </div>
              )}

              {titlePreviewUrl && (
                <div>
                  <Label>Preview</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={titlePreviewUrl}
                      alt="Title background preview"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              )}

              {(orgStructure?.titleBackground || titlePreviewUrl) && (
                <Button
                  variant="destructive"
                  onClick={handleRemoveTitleBackground}
                  disabled={removeTitleBackgroundMutation.isPending}
                  className="w-full"
                >
                  {removeTitleBackgroundMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Title Background
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="static">
          <Card>
            <CardHeader>
              <CardTitle>Static Image (1920×800 px)</CardTitle>
              <CardDescription>
                Upload or link to a static image that replaces the School Leadership section (auto-saves after selection)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Upload Type</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    type="button"
                    variant={staticUploadType === 'device' ? 'default' : 'outline'}
                    onClick={() => {
                      setStaticUploadType('device');
                      setStaticUrl('');
                      setStaticPreviewUrl(null);
                      setStaticValidationError(null);
                    }}
                    className={staticUploadType === 'device' ? 'bg-maroon hover:bg-maroon/90' : ''}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Device Upload
                  </Button>
                  <Button
                    type="button"
                    variant={staticUploadType === 'url' ? 'default' : 'outline'}
                    onClick={() => {
                      setStaticUploadType('url');
                      setStaticFile(null);
                      setStaticPreviewUrl(null);
                    }}
                    className={staticUploadType === 'url' ? 'bg-maroon hover:bg-maroon/90' : ''}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    External Link
                  </Button>
                </div>
              </div>

              {staticUploadType === 'device' ? (
                <div>
                  <Label htmlFor="staticFile">Select Image File</Label>
                  <Input
                    id="staticFile"
                    type="file"
                    accept="image/*"
                    onChange={handleStaticFileChange}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 1920×800 pixels. Auto-saves 2 seconds after file selection
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="staticUrl">External Image URL</Label>
                  <Input
                    id="staticUrl"
                    type="text"
                    value={staticUrl}
                    onChange={(e) => setStaticUrl(e.target.value)}
                    placeholder="Paste Google Drive, OneDrive, Dropbox, or direct image link..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 1920×800 pixels. Auto-saves 2 seconds after validation completes
                  </p>
                  {staticValidating && (
                    <p className="text-sm text-blue-600 mt-2 flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </p>
                  )}
                  {staticValidationError && (
                    <p className="text-sm text-red-600 mt-2">{staticValidationError}</p>
                  )}
                  {staticUrl && !staticValidating && !staticValidationError && staticPreviewUrl && (
                    <p className="text-sm text-green-600 mt-2">✓ Valid image URL - will auto-save in 2 seconds</p>
                  )}
                </div>
              )}

              {staticUploadProgress > 0 && staticUploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{staticUploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${staticUploadProgress}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)',
                      }}
                    />
                  </div>
                </div>
              )}

              {staticPreviewUrl && (
                <div>
                  <Label>Preview</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={staticPreviewUrl}
                      alt="Static image preview"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              )}

              {(orgStructure?.staticImage || staticPreviewUrl) && (
                <Button
                  variant="destructive"
                  onClick={handleRemoveStaticImage}
                  disabled={removeStaticImageMutation.isPending}
                  className="w-full"
                >
                  {removeStaticImageMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Static Image
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
