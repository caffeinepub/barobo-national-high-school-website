import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetHistoryContent, useUpdateHistoryContent, useUpdateHistoryBackgroundImage } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle, Save, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import { FormattedText, TextAlignment, FontStyle } from '../backend';
import { convertToDirectImageUrl, detectCloudProvider } from '@/lib/urlConverter';
import { uploadFile, uploadFromURL, validateUploadedBlob } from '@/lib/externalBlobUpload';
import { getUploadErrorMessage, logUploadError } from '@/lib/uploadErrorMessage';
import { toast } from 'sonner';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function HistoryManagementPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: historyContent, isLoading, error } = useGetHistoryContent();
  const updateContentMutation = useUpdateHistoryContent();
  const updateBackgroundMutation = useUpdateHistoryBackgroundImage();

  const [title, setTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string>('');

  useEffect(() => {
    if (historyContent) {
      setTitle(historyContent.title || '');
      setEditorContent(historyContent.formattedText?.content || '');
      if (historyContent.backgroundImage) {
        const bgUrl = historyContent.backgroundImage.getDirectURL();
        setPreviewUrl(bgUrl);
      } else {
        setPreviewUrl('');
      }
    }
  }, [historyContent]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (imageUrl.trim()) {
      setIsValidating(true);
      setValidationError('');

      timeoutId = setTimeout(async () => {
        try {
          const convertedUrl = convertToDirectImageUrl(imageUrl.trim());

          const img = new Image();
          img.crossOrigin = 'anonymous';

          const loadPromise = new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = convertedUrl;
          });

          const timeoutPromise = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Image loading timed out')), 10000)
          );

          await Promise.race([loadPromise, timeoutPromise]);

          setPreviewUrl(convertedUrl);
          setValidationError('');
        } catch (err) {
          const provider = detectCloudProvider(imageUrl.trim());
          let errorMessage = 'Failed to load image. ';

          if (provider === 'google-drive') {
            errorMessage += 'For Google Drive: Make sure the file is set to "Anyone with the link can view" in sharing settings.';
          } else if (provider === 'onedrive') {
            errorMessage += 'For OneDrive: Make sure the file is shared publicly and not restricted to specific people.';
          } else if (provider === 'dropbox') {
            errorMessage += 'For Dropbox: Make sure the link is a public sharing link and not a private link.';
          } else {
            errorMessage += 'Please check that the URL is correct and the image is publicly accessible.';
          }

          setValidationError(errorMessage);
          setPreviewUrl('');
        } finally {
          setIsValidating(false);
        }
      }, 300);
    } else {
      setIsValidating(false);
      setValidationError('');
      if (historyContent?.backgroundImage) {
        setPreviewUrl(historyContent.backgroundImage.getDirectURL());
      } else {
        setPreviewUrl('');
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [imageUrl, historyContent]);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ align: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline'],
        ['clean'],
      ],
    }),
    []
  );

  const formats = [
    'align',
    'size',
    'bold',
    'italic',
    'underline',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setImageFile(file);
      setImageUrl('');
      setValidationError('');
      setValidationWarning('');

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const parseFormattedTextFromHTML = (html: string): FormattedText => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    let alignment: TextAlignment = TextAlignment.left;
    let fontSize: number = 16;
    let fontStyle: FontStyle = FontStyle.normal;

    const firstElement = tempDiv.querySelector('p, div, span');
    if (firstElement) {
      const textAlign = (firstElement as HTMLElement).style.textAlign;
      if (textAlign === 'center') alignment = TextAlignment.center;
      else if (textAlign === 'right') alignment = TextAlignment.right;
      else if (textAlign === 'justify') alignment = TextAlignment.justify;

      const sizeClass = firstElement.className.match(/ql-size-(small|large|huge)/);
      if (sizeClass) {
        if (sizeClass[1] === 'small') fontSize = 12;
        else if (sizeClass[1] === 'large') fontSize = 20;
        else if (sizeClass[1] === 'huge') fontSize = 24;
      }

      if (firstElement.querySelector('strong')) fontStyle = FontStyle.bold;
      else if (firstElement.querySelector('em')) fontStyle = FontStyle.italic;
      else if (firstElement.querySelector('u')) fontStyle = FontStyle.underline;
    }

    return {
      content: html,
      alignment,
      fontSize,
      fontStyle,
    };
  };

  const handleSaveContent = async () => {
    if (!title.trim() || !editorContent.trim()) {
      toast.error('Please fill in both title and text content');
      return;
    }

    if (isUploading) {
      toast.error('Please wait for the current upload to complete');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setValidationWarning('');
      const formattedText = parseFormattedTextFromHTML(editorContent);

      // First update the text content
      await updateContentMutation.mutateAsync({
        title: title.trim(),
        formattedText,
      });

      // Then update background image if provided
      if (imageFile || imageUrl.trim()) {
        try {
          let backgroundBlob;

          if (imageFile) {
            backgroundBlob = await uploadFile(imageFile, {
              onProgress: (percentage) => setUploadProgress(percentage),
              onError: (error) => logUploadError(error, 'History Background Upload'),
            });
          } else {
            const convertedUrl = convertToDirectImageUrl(imageUrl.trim());
            backgroundBlob = uploadFromURL(convertedUrl);
          }

          await updateBackgroundMutation.mutateAsync(backgroundBlob);
          
          // Validate that the blob URL is accessible (non-blocking)
          const validationResult = await validateUploadedBlob(backgroundBlob);
          
          if (validationResult.status === 'pending') {
            setValidationWarning(validationResult.message);
            toast.success('History content saved! Background image is still processing.', {
              duration: 5000,
            });
          } else if (validationResult.status === 'failed') {
            logUploadError(validationResult.error, 'History Background Validation');
            setValidationWarning('Background image saved but could not be verified. Please refresh the page.');
            toast.success('History content saved! Please refresh to verify the background image.', {
              duration: 5000,
            });
          } else {
            toast.success('History content and background updated successfully!');
          }
        } catch (uploadError) {
          logUploadError(uploadError, 'History Background Upload');
          toast.error(getUploadErrorMessage(uploadError));
          setUploadProgress(0);
          setIsUploading(false);
          return;
        }
      } else {
        toast.success('History content updated successfully!');
      }

      setImageFile(null);
      setImageUrl('');
      setUploadProgress(0);
    } catch (error: any) {
      logUploadError(error, 'History Content Update');
      toast.error(getUploadErrorMessage(error));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateBackgroundOnly = async () => {
    if (isUploading) {
      toast.error('Please wait for the current upload to complete');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setValidationWarning('');
      let backgroundBlob;

      if (imageFile) {
        backgroundBlob = await uploadFile(imageFile, {
          onProgress: (percentage) => setUploadProgress(percentage),
          onError: (error) => logUploadError(error, 'History Background Only Upload'),
        });
      } else if (imageUrl.trim()) {
        const convertedUrl = convertToDirectImageUrl(imageUrl.trim());
        backgroundBlob = uploadFromURL(convertedUrl);
      } else {
        toast.error('Please provide a background image');
        setIsUploading(false);
        return;
      }

      await updateBackgroundMutation.mutateAsync(backgroundBlob);
      
      // Validate that the blob URL is accessible (non-blocking)
      const validationResult = await validateUploadedBlob(backgroundBlob);
      
      if (validationResult.status === 'pending') {
        setValidationWarning(validationResult.message);
        toast.success('Background image uploaded! It is still processing.', {
          duration: 5000,
        });
      } else if (validationResult.status === 'failed') {
        logUploadError(validationResult.error, 'History Background Validation');
        setValidationWarning('Background image saved but could not be verified. Please refresh the page.');
        toast.success('Background image uploaded! Please refresh to verify.', {
          duration: 5000,
        });
      } else {
        toast.success('Background image updated successfully!');
      }

      setImageFile(null);
      setImageUrl('');
      setUploadProgress(0);
    } catch (error: any) {
      logUploadError(error, 'History Background Only Update');
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
              You must be logged in to access the History Management page. Please log in using the Admin Login button.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            onClick={() => navigate({ to: '/admin/dashboard' })} 
            className="gap-2 bg-[#800000] hover:bg-[#9a0000] text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-school-blue">History Management</h1>
        </div>

        {validationWarning && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {validationWarning}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : error && !error.message?.includes('No content found') ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load history content. Please try again later.</AlertDescription>
          </Alert>
        ) : (
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-school-blue">Edit History Content</CardTitle>
              <CardDescription>
                Update the title, text content, and optional background image for the History page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#800000] font-semibold">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter history section title"
                  className="border-school-gold/30 focus:border-school-gold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#800000] font-semibold">
                  Text Content
                </Label>
                <div className="heritage-editor-container">
                  <ReactQuill
                    theme="snow"
                    value={editorContent}
                    onChange={setEditorContent}
                    modules={modules}
                    formats={formats}
                    placeholder="Enter history content here..."
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-school-gold/20 p-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-school-maroon" />
                  <Label className="text-[#800000] font-semibold">
                    Background Image (Optional)
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-file" className="text-sm text-gray-600">
                    Upload from Device
                  </Label>
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border-school-gold/30"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-300" />
                  <span className="text-sm text-gray-500">OR</span>
                  <div className="h-px flex-1 bg-gray-300" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-url" className="text-sm text-gray-600">
                    External Image Link
                  </Label>
                  <Input
                    id="image-url"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL (Google Drive, OneDrive, Dropbox, etc.)"
                    className="border-school-gold/30"
                  />
                  {isValidating && (
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Validating...
                    </p>
                  )}
                  {validationError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{validationError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {previewUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Preview</Label>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gray-100">
                      <img
                        src={previewUrl}
                        alt="Background preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {(imageFile || imageUrl.trim()) && (
                  <Button
                    onClick={handleUpdateBackgroundOnly}
                    disabled={isUploading || updateBackgroundMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUploading || updateBackgroundMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {uploadProgress > 0 && uploadProgress < 100
                          ? `Uploading... ${uploadProgress}%`
                          : 'Updating...'}
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Update Background Only
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSaveContent}
                  disabled={isUploading || updateContentMutation.isPending || updateBackgroundMutation.isPending}
                  className="flex-1 bg-[#800000] hover:bg-[#9a0000] text-white"
                >
                  {isUploading || updateContentMutation.isPending || updateBackgroundMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {uploadProgress > 0 && uploadProgress < 100
                        ? `Uploading... ${uploadProgress}%`
                        : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save All Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
