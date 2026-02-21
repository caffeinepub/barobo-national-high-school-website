import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetBNHSHymnVideo, useSetBNHSHymn } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, AlertCircle, Loader2, Video, AlertTriangle } from 'lucide-react';
import { convertToDirectImageUrl } from '@/lib/urlConverter';
import { uploadFile, uploadFromURL, validateUploadedBlob } from '@/lib/externalBlobUpload';
import { getUploadErrorMessage, logUploadError } from '@/lib/uploadErrorMessage';
import { toast } from 'sonner';

export default function BNHSHymnManagementPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: hymnVideo, isLoading } = useGetBNHSHymnVideo();
  const setHymnMutation = useSetBNHSHymn();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string>('');

  useEffect(() => {
    if (hymnVideo) {
      const url = hymnVideo.getDirectURL();
      setPreviewUrl(url);
    }
  }, [hymnVideo]);

  useEffect(() => {
    if (uploadMode === 'url' && videoUrl.trim()) {
      const timeoutId = setTimeout(() => {
        const directUrl = convertToDirectImageUrl(videoUrl);
        setPreviewUrl(directUrl);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (uploadMode === 'url') {
      setPreviewUrl(null);
    }
  }, [videoUrl, uploadMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }

      setVideoFile(file);
      setValidationWarning('');
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleUpload = async () => {
    if (isUploading) {
      toast.error('Please wait for the current upload to complete');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setValidationWarning('');
      let videoBlob;

      if (uploadMode === 'file' && videoFile) {
        videoBlob = await uploadFile(videoFile, {
          onProgress: (percentage) => setUploadProgress(percentage),
          onError: (error) => logUploadError(error, 'BNHS Hymn Upload'),
        });
      } else if (uploadMode === 'url' && videoUrl.trim()) {
        const directUrl = convertToDirectImageUrl(videoUrl);
        videoBlob = uploadFromURL(directUrl);
      } else {
        toast.error('Please provide a video file or URL');
        setIsUploading(false);
        return;
      }

      await setHymnMutation.mutateAsync(videoBlob);
      
      // Validate that the blob URL is accessible (non-blocking)
      const validationResult = await validateUploadedBlob(videoBlob);
      
      if (validationResult.status === 'pending') {
        setValidationWarning(validationResult.message);
        toast.success('BNHS Hymn video uploaded! It is still processing.', {
          duration: 5000,
        });
      } else if (validationResult.status === 'failed') {
        logUploadError(validationResult.error, 'BNHS Hymn Validation');
        setValidationWarning('Video saved but could not be verified. Please refresh the page.');
        toast.success('BNHS Hymn video uploaded! Please refresh to verify.', {
          duration: 5000,
        });
      } else {
        toast.success('BNHS Hymn video uploaded successfully!');
      }

      setVideoFile(null);
      setVideoUrl('');
      setUploadProgress(0);
    } catch (error: any) {
      logUploadError(error, 'BNHS Hymn Upload');
      toast.error(getUploadErrorMessage(error));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            onClick={() => navigate({ to: '/admin/dashboard' })} 
            className="gap-2 bg-[#800000] hover:bg-[#9a0000] text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-school-blue">BNHS Hymn Management</h1>
        </div>

        {validationWarning && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {validationWarning}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-school-gold/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-school-blue flex items-center gap-2">
              <Video className="h-5 w-5" />
              Upload BNHS Hymn Video
            </CardTitle>
            <CardDescription>
              Upload a video file from your device or provide an external link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 border-b pb-4">
              <Button
                variant={uploadMode === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadMode('file')}
                className={uploadMode === 'file' ? 'bg-[#800000] hover:bg-[#9a0000]' : ''}
              >
                Upload from Device
              </Button>
              <Button
                variant={uploadMode === 'url' ? 'default' : 'outline'}
                onClick={() => setUploadMode('url')}
                className={uploadMode === 'url' ? 'bg-[#800000] hover:bg-[#9a0000]' : ''}
              >
                External Link
              </Button>
            </div>

            {uploadMode === 'file' ? (
              <div className="space-y-2">
                <Label htmlFor="video-file" className="text-[#800000] font-semibold">
                  Select Video File
                </Label>
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="border-school-gold/30"
                />
                {videoFile && (
                  <p className="text-sm text-gray-600">
                    Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="video-url" className="text-[#800000] font-semibold">
                  Video URL
                </Label>
                <Input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste video URL (Google Drive, OneDrive, Dropbox, etc.)"
                  className="border-school-gold/30"
                />
              </div>
            )}

            {previewUrl && (
              <div className="space-y-2">
                <Label className="text-[#800000] font-semibold">Current/Preview Video</Label>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
                  <video
                    src={previewUrl}
                    controls
                    className="h-full w-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={
                isUploading ||
                setHymnMutation.isPending ||
                (uploadMode === 'file' && !videoFile) ||
                (uploadMode === 'url' && !videoUrl.trim())
              }
              className="w-full bg-[#800000] hover:bg-[#9a0000] text-white"
            >
              {isUploading || setHymnMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploadProgress > 0 && uploadProgress < 100
                    ? `Uploading... ${uploadProgress}%`
                    : 'Saving...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload BNHS Hymn Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
