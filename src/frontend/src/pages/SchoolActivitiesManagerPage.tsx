import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetSliderImages,
  useAddSliderImage,
  useAddSliderImageFromURL,
  useUpdateSliderImage,
  useDeleteSliderImage,
} from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Upload, Trash2, Edit, ArrowLeft, ExternalLink } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { convertToDirectImageUrl } from '../lib/urlConverter';
import { validateProxiedImageUrl } from '../lib/imageProxy';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';

export default function SchoolActivitiesManagerPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { data: sliderImages, isLoading } = useGetSliderImages();
  const addSliderImage = useAddSliderImage();
  const addSliderImageFromURL = useAddSliderImageFromURL();
  const updateSliderImage = useUpdateSliderImage();
  const deleteSliderImage = useDeleteSliderImage();

  const [uploadType, setUploadType] = useState<'device' | 'url'>('device');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<bigint | null>(null);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

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
      if (uploadType === 'device' && selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        const isAnimated = selectedFile.type === 'image/gif';

        if (editingId !== null) {
          await updateSliderImage.mutateAsync({
            id: editingId,
            file: blob,
            title,
            description,
            displayOrder: BigInt(0),
            isAnimated,
          });
          toast.success('Slider image updated successfully!');
        } else {
          await addSliderImage.mutateAsync({
            file: blob,
            title,
            description,
            isAnimated,
          });
          toast.success('Slider image added successfully!');
        }
      } else if (uploadType === 'url' && externalUrl.trim()) {
        if (!previewUrl) {
          toast.error('Please wait for URL validation to complete');
          return;
        }

        const convertedUrl = convertToDirectImageUrl(externalUrl.trim());

        if (editingId !== null) {
          // For URL updates, we need to use the URL-based mutation
          // Since updateSliderImage expects a file, we'll need to handle this differently
          // For now, we'll convert the URL to a blob
          const blob = ExternalBlob.fromURL(convertedUrl);
          await updateSliderImage.mutateAsync({
            id: editingId,
            file: blob,
            title,
            description,
            displayOrder: BigInt(0),
            isAnimated: false,
          });
          toast.success('Slider image updated successfully!');
        } else {
          await addSliderImageFromURL.mutateAsync({
            url: convertedUrl,
            title,
            description,
          });
          toast.success('Slider image added successfully!');
        }
      }

      setSelectedFile(null);
      setExternalUrl('');
      setTitle('');
      setDescription('');
      setPreviewUrl(null);
      setEditingId(null);
      setValidationError(null);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Error managing slider image:', error);
      toast.error(error.message || 'Failed to manage slider image');
    }
  };

  const handleEdit = (image: any) => {
    setEditingId(image.id);
    setTitle(image.title);
    setDescription(image.description);

    if (image.image.__kind__ === 'url') {
      setUploadType('url');
      setExternalUrl(image.image.url);
    } else {
      setUploadType('device');
      setPreviewUrl(image.image.file.file.getDirectURL());
    }
  };

  const handleDelete = async (id: bigint) => {
    if (window.confirm('Are you sure you want to delete this slider image?')) {
      try {
        await deleteSliderImage.mutateAsync(id);
        toast.success('Slider image deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting slider image:', error);
        toast.error(error.message || 'Failed to delete slider image');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedFile(null);
    setExternalUrl('');
    setTitle('');
    setDescription('');
    setPreviewUrl(null);
    setValidationError(null);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Toaster />
      <div className="mb-6">
        <Button
          onClick={() => navigate({ to: '/admin/dashboard' })}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-maroon">School Activities Manager</h1>
        <p className="text-gray-600 mt-2">
          Manage school activities slider images (optimized for 1248×600 pixels)
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingId !== null ? 'Edit Slider Image' : 'Add New Slider Image'}</CardTitle>
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
                <Label htmlFor="file">Select Image File</Label>
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
                placeholder="Enter image title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description"
                className="mt-1"
                rows={3}
              />
            </div>

            {previewUrl && (
              <div>
                <Label>Preview (1248×600 px optimized)</Label>
                <div className="mt-2 border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto object-cover aspect-[1248/600]"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={
                  addSliderImage.isPending ||
                  addSliderImageFromURL.isPending ||
                  updateSliderImage.isPending ||
                  isValidating ||
                  (uploadType === 'url' && !previewUrl)
                }
                className="bg-maroon hover:bg-maroon/90"
              >
                {addSliderImage.isPending || addSliderImageFromURL.isPending || updateSliderImage.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingId !== null ? 'Updating...' : 'Adding...'}
                  </>
                ) : editingId !== null ? (
                  'Update Image'
                ) : (
                  'Add Image'
                )}
              </Button>
              {editingId !== null && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Slider Images</CardTitle>
        </CardHeader>
        <CardContent>
          {!sliderImages || sliderImages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No slider images yet. Add your first image above!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sliderImages
                .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
                .map((image) => {
                  const imageUrl =
                    image.image.__kind__ === 'url'
                      ? image.image.url
                      : image.image.file.file.getDirectURL();

                  return (
                    <Card key={Number(image.id)} className="overflow-hidden">
                      <div className="aspect-[1248/600] relative">
                        <img
                          src={`${imageUrl}?t=${Date.now()}`}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{image.description}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(image)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(image.id)}
                            disabled={deleteSliderImage.isPending}
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
