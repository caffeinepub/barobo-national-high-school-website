import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, Link as LinkIcon, AlertCircle, CheckCircle, Loader2, Video } from 'lucide-react';
import { useGetBNHSHymnVideo, useUploadBNHSHymnVideo, useRemoveBNHSHymnVideo } from '@/hooks/useQueries';
import { ExternalBlob } from '@/backend';
import { convertToDirectImageUrl, detectCloudProvider, getProviderName } from '@/lib/urlConverter';
import { validateProxiedImageUrl } from '@/lib/imageProxy';
import { toast } from 'sonner';

export default function BNHSHymnManagementPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: currentVideo, isLoading: videoLoading } = useGetBNHSHymnVideo();
  const uploadVideoMutation = useUploadBNHSHymnVideo();
  const removeVideoMutation = useRemoveBNHSHymnVideo();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentVideo) {
      const videoUrl = currentVideo.getDirectURL();
      setPreviewUrl(videoUrl);
    }
  }, [currentVideo]);

  // Auto-save function with debounce
  const autoSave = useCallback(async (blob: ExternalBlob) => {
    try {
      await uploadVideoMutation.mutateAsync(blob);
      toast.success('Auto-saved successfully ✅');
    } catch (error: any) {
      console.error('Auto-save error:', error);
      toast.error('Auto-save failed. Please try manual save.');
    }
  }, [uploadVideoMutation]);

  // Validate external URL with debounce
  useEffect(() => {
    if (uploadMode === 'url' && videoUrl.trim()) {
      const timeoutId = setTimeout(async () => {
        setIsValidating(true);
        setValidationMessage(null);

        const provider = detectCloudProvider(videoUrl);
        if (provider !== 'other') {
          const providerName = getProviderName(provider);
          setValidationMessage({
            type: 'success',
            text: `${providerName} link detected. Converting to direct URL...`,
          });
        }

        const directUrl = convertToDirectImageUrl(videoUrl);
        const validation = await validateProxiedImageUrl(directUrl);

        setIsValidating(false);

        if (validation.valid) {
          setValidationMessage({
            type: 'success',
            text: 'Video URL is valid and accessible!',
          });
          setPreviewUrl(directUrl);
          
          // Auto-save after successful validation
          if (autoSaveTimer) clearTimeout(autoSaveTimer);
          const timer = setTimeout(() => {
            const blob = ExternalBlob.fromURL(directUrl);
            autoSave(blob);
          }, 2000);
          setAutoSaveTimer(timer);
        } else {
          setValidationMessage({
            type: 'error',
            text: validation.error || 'Failed to validate video URL',
          });
          setPreviewUrl(null);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setValidationMessage(null);
      if (uploadMode === 'url') {
        setPreviewUrl(null);
      }
    }
  }, [videoUrl, uploadMode, autoSave, autoSaveTimer]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setValidationMessage({ type: 'success', text: 'Video file selected successfully!' });
        
        // Auto-save after file selection
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        const timer = setTimeout(async () => {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const blob = ExternalBlob.fromBytes(uint8Array);
            await autoSave(blob);
          } catch (error) {
            console.error('Auto-save error:', error);
          }
        }, 2000);
        setAutoSaveTimer(timer);
      } else {
        setValidationMessage({ type: 'error', text: 'Please select a valid video file (MP4, WebM, etc.)' });
        setVideoFile(null);
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    try {
      setUploadProgress(0);
      setValidationMessage({ type: 'success', text: 'Starting upload...' });

      if (uploadMode === 'file' && videoFile) {
        const arrayBuffer = await videoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
          setValidationMessage({ 
            type: 'success', 
            text: `Uploading video... ${Math.round(percentage)}%` 
          });
        });

        await uploadVideoMutation.mutateAsync(blob);
        
        toast.success('Video uploaded successfully ✅');
        setValidationMessage({ type: 'success', text: 'Video uploaded successfully!' });
        setVideoFile(null);
        setUploadProgress(0);
        
        const fileInput = document.getElementById('video-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
      } else if (uploadMode === 'url' && videoUrl.trim()) {
        const directUrl = convertToDirectImageUrl(videoUrl);
        
        setValidationMessage({ type: 'success', text: 'Processing external video link...' });
        
        const blob = ExternalBlob.fromURL(directUrl).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
          setValidationMessage({ 
            type: 'success', 
            text: `Processing video... ${Math.round(percentage)}%` 
          });
        });

        await uploadVideoMutation.mutateAsync(blob);
        
        toast.success('Video from external link uploaded successfully ✅');
        setValidationMessage({ type: 'success', text: 'Video from external link uploaded successfully!' });
        setVideoUrl('');
        setUploadProgress(0);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadProgress(0);
      toast.error(error.message || 'Failed to upload video');
      setValidationMessage({ 
        type: 'error', 
        text: error.message || 'Failed to upload video. Please try again.' 
      });
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove the BNHS Hymn video?')) {
      try {
        await removeVideoMutation.mutateAsync();
        toast.success('Video removed successfully ✅');
        setValidationMessage({ type: 'success', text: 'Video removed successfully!' });
        setPreviewUrl(null);
      } catch (error: any) {
        toast.error(error.message || 'Failed to remove video');
        setValidationMessage({ type: 'error', text: error.message || 'Failed to remove video' });
      }
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [autoSaveTimer]);

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to access the BNHS Hymn management page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const isUploading = uploadVideoMutation.isPending || uploadProgress > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            onClick={() => navigate({ to: '/admin/dashboard' })} 
            className="gap-2 bg-[#800000] hover:bg-[#9a0000] text-white"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-school-blue">BNHS Hymn Management</h1>
        </div>

        {validationMessage && (
          <Alert variant={validationMessage.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            {validationMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{validationMessage.text}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 border-school-gold/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-school-blue flex items-center gap-2">
              <Video className="h-5 w-5" />
              Upload BNHS Hymn Video
            </CardTitle>
            <CardDescription>
              Upload a video file from your device or paste an external video link. Changes are automatically saved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={uploadMode === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadMode('file')}
                className={uploadMode === 'file' ? 'bg-school-maroon hover:bg-school-maroon-dark' : ''}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button
                variant={uploadMode === 'url' ? 'default' : 'outline'}
                onClick={() => setUploadMode('url')}
                className={uploadMode === 'url' ? 'bg-school-maroon hover:bg-school-maroon-dark' : ''}
                disabled={isUploading}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                External Link
              </Button>
            </div>

            {uploadMode === 'file' ? (
              <div className="space-y-2">
                <Label htmlFor="video-file">Select Video File</Label>
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  disabled={isUploading}
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: MP4, WebM, and other standard video formats. Auto-saves after selection.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  type="url"
                  placeholder="Paste Google Drive, OneDrive, or Dropbox video link..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isUploading}
                />
                {isValidating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validating...
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Paste a sharing link from Google Drive, OneDrive, or Dropbox. Auto-saves after validation.
                </p>
              </div>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-school-maroon h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={
                isUploading ||
                (uploadMode === 'file' && !videoFile) ||
                (uploadMode === 'url' && (!videoUrl.trim() || isValidating))
              }
              className="w-full bg-school-maroon hover:bg-school-maroon-dark"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video (Manual Save)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-school-gold/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-school-blue">Current BNHS Hymn Video</CardTitle>
            <CardDescription>Preview of the currently uploaded video</CardDescription>
          </CardHeader>
          <CardContent>
            {videoLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-school-maroon" />
              </div>
            ) : previewUrl ? (
              <div className="space-y-4">
                <video
                  controls
                  playsInline
                  className="w-full rounded-lg shadow-md"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                  key={previewUrl}
                >
                  <source src={previewUrl} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
                {currentVideo && (
                  <Button
                    onClick={handleRemove}
                    disabled={removeVideoMutation.isPending}
                    variant="destructive"
                    className="w-full"
                  >
                    {removeVideoMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      'Remove Video'
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-12 text-center">
                <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No video uploaded yet. Upload a video file or paste an external link to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
