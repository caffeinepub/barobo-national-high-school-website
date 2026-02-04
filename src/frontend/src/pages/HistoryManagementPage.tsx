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
import { ArrowLeft, AlertCircle, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ExternalBlob, FormattedText, TextAlignment, FontStyle } from '../backend';
import { convertToDirectImageUrl, detectCloudProvider, getProviderName } from '@/lib/urlConverter';
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

  useEffect(() => {
    if (historyContent) {
      setTitle(historyContent.title || '');
      setEditorContent(historyContent.formattedText?.content || '');
      if (historyContent.backgroundImage) {
        const bgUrl = `${historyContent.backgroundImage.getDirectURL()}?t=${historyContent.lastUpdated}`;
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
        setPreviewUrl(`${historyContent.backgroundImage.getDirectURL()}?t=${historyContent.lastUpdated}`);
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

    try {
      const formattedText = parseFormattedTextFromHTML(editorContent);

      // First update the text content
      await updateContentMutation.mutateAsync({
        title: title.trim(),
        formattedText,
      });

      // Then update background image if provided
      if (imageFile || imageUrl.trim()) {
        let backgroundBlob: ExternalBlob;

        if (imageFile) {
          const arrayBuffer = await imageFile.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          backgroundBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
            setUploadProgress(percentage);
          });
        } else {
          const convertedUrl = convertToDirectImageUrl(imageUrl.trim());
          backgroundBlob = ExternalBlob.fromURL(convertedUrl);
        }

        await updateBackgroundMutation.mutateAsync(backgroundBlob);
      }

      toast.success('History content updated successfully!');
      setImageFile(null);
      setImageUrl('');
      setUploadProgress(0);
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update history content');
    }
  };

  const handleUpdateBackgroundOnly = async () => {
    try {
      let backgroundBlob: ExternalBlob;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        backgroundBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (imageUrl.trim()) {
        const convertedUrl = convertToDirectImageUrl(imageUrl.trim());
        backgroundBlob = ExternalBlob.fromURL(convertedUrl);
      } else {
        toast.error('Please provide a background image');
        return;
      }

      await updateBackgroundMutation.mutateAsync(backgroundBlob);

      toast.success('Background image updated successfully!');
      setImageFile(null);
      setImageUrl('');
      setUploadProgress(0);
    } catch (error: any) {
      console.error('Background update error:', error);
      toast.error(error.message || 'Failed to update background image');
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
          <div className="space-y-6">
            {/* Content Editor */}
            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-school-blue">Heritage Section Content</CardTitle>
                <CardDescription>Edit the title and text content for the History page with rich formatting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Heritage Section Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter section title (e.g., Our Heritage)"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textContent">Text Content</Label>
                  <div className="heritage-editor-wrapper border rounded-md overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={editorContent}
                      onChange={setEditorContent}
                      modules={modules}
                      formats={formats}
                      placeholder="Enter the history content with formatting..."
                      className="min-h-[300px]"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use the toolbar to format text with alignment, font size, bold, italic, and underline styles.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Background Image Manager */}
            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-school-blue">Background Image (Optional)</CardTitle>
                <CardDescription>Upload or link to a background image for the History page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageFile">Upload from Device</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImageFile(null);
                        const input = document.getElementById('imageFile') as HTMLInputElement;
                        if (input) input.value = '';
                        if (historyContent?.backgroundImage) {
                          setPreviewUrl(`${historyContent.backgroundImage.getDirectURL()}?t=${historyContent.lastUpdated}`);
                        } else {
                          setPreviewUrl('');
                        }
                      }}
                      disabled={!imageFile}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">External Image URL (Google Drive, OneDrive, Dropbox)</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL here..."
                    disabled={!!imageFile}
                  />
                  {isValidating && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validating...
                    </p>
                  )}
                  {validationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{validationError}</AlertDescription>
                    </Alert>
                  )}
                  {imageUrl && !isValidating && !validationError && (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      ✓ Valid {getProviderName(detectCloudProvider(imageUrl))} image URL
                    </p>
                  )}
                </div>

                {previewUrl && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="heritage-background-preview relative aspect-[16/5] w-full overflow-hidden rounded-lg border bg-gray-50">
                      <img
                        src={previewUrl}
                        alt="Background preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {!previewUrl && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="heritage-background-preview relative aspect-[16/5] w-full overflow-hidden rounded-lg border bg-gray-50 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No background image selected</p>
                        <p className="text-xs">A neutral background will be used</p>
                      </div>
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
                        className="h-full bg-school-blue transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateBackgroundOnly}
                    disabled={
                      updateBackgroundMutation.isPending ||
                      (!imageFile && !imageUrl.trim()) ||
                      isValidating ||
                      !!validationError
                    }
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                    variant="default"
                  >
                    {updateBackgroundMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4" />
                        Update Background Only
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save All Button */}
            <Card className="border-school-gold/20 shadow-lg">
              <CardContent className="pt-6">
                <Button
                  onClick={handleSaveContent}
                  disabled={
                    updateContentMutation.isPending ||
                    !title.trim() ||
                    !editorContent.trim() ||
                    isValidating ||
                    !!validationError
                  }
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {updateContentMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save All Changes
                    </>
                  )}
                </Button>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Changes will appear instantly on the History page
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
