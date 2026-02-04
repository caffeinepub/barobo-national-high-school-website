import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerPermissions } from '@/hooks/useQueries';
import { useGetOrganizationalStructure, useUpdateOrgStructureTitleBackground, useUpdateOrgStructureStaticImage, useRemoveOrgStructureTitleBackground, useRemoveOrgStructureStaticImage } from '@/hooks/useQueries';
import { ExternalBlob, AdminPermission } from '@/backend';
import { toast } from 'sonner';
import { convertToDirectImageUrl } from '@/lib/urlConverter';
import { validateProxiedImageUrl } from '@/lib/imageProxy';
import { useActor } from '@/hooks/useActor';

export default function OrganizationalStructureManagementPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: permissions } = useGetCallerPermissions();
  const { data: orgStructure, isLoading: orgStructureLoading } = useGetOrganizationalStructure();

  const updateTitleBackground = useUpdateOrgStructureTitleBackground();
  const updateStaticImage = useUpdateOrgStructureStaticImage();
  const removeTitleBackground = useRemoveOrgStructureTitleBackground();
  const removeStaticImage = useRemoveOrgStructureStaticImage();

  // Title Background State
  const [titleBgFile, setTitleBgFile] = useState<File | null>(null);
  const [titleBgUrl, setTitleBgUrl] = useState('');
  const [titleBgPreview, setTitleBgPreview] = useState<string | null>(null);
  const [titleBgValidating, setTitleBgValidating] = useState(false);
  const [titleBgValidationStatus, setTitleBgValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [titleBgValidationMessage, setTitleBgValidationMessage] = useState('');

  // Static Image State
  const [staticImageFile, setStaticImageFile] = useState<File | null>(null);
  const [staticImageUrl, setStaticImageUrl] = useState('');
  const [staticImagePreview, setStaticImagePreview] = useState<string | null>(null);
  const [staticImageValidating, setStaticImageValidating] = useState(false);
  const [staticImageValidationStatus, setStaticImageValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [staticImageValidationMessage, setStaticImageValidationMessage] = useState('');

  const hasPermission = permissions?.includes(AdminPermission.ManageHeritage);

  useEffect(() => {
    if (!identity || !hasPermission) {
      navigate({ to: '/admin/dashboard' });
    }
  }, [identity, hasPermission, navigate]);

  // Load existing images
  useEffect(() => {
    if (orgStructure?.titleBackground) {
      const url = orgStructure.titleBackground.getDirectURL();
      setTitleBgPreview(`${url}?t=${Date.now()}`);
    }
    if (orgStructure?.staticImage) {
      const url = orgStructure.staticImage.getDirectURL();
      setStaticImagePreview(`${url}?t=${Date.now()}`);
    }
  }, [orgStructure]);

  // Title Background Handlers
  const handleTitleBgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTitleBgFile(file);
    setTitleBgUrl('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setTitleBgPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-save
    await handleTitleBgSave(file, null);
  };

  const handleTitleBgUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setTitleBgUrl(url);
    setTitleBgFile(null);

    if (!url.trim()) {
      setTitleBgPreview(null);
      setTitleBgValidationStatus('idle');
      setTitleBgValidationMessage('');
      return;
    }

    // Validate and convert URL
    setTitleBgValidating(true);
    setTitleBgValidationStatus('validating');
    setTitleBgValidationMessage('Validating link...');

    try {
      const convertedUrl = convertToDirectImageUrl(url);
      const result = await validateProxiedImageUrl(convertedUrl, actor);
      
      if (result.valid && result.proxyUrl) {
        setTitleBgPreview(result.proxyUrl);
        setTitleBgValidationStatus('success');
        setTitleBgValidationMessage('Link validated successfully');
        
        // Auto-save
        setTimeout(() => handleTitleBgSave(null, result.proxyUrl || null), 500);
      } else {
        setTitleBgValidationStatus('error');
        setTitleBgValidationMessage(result.error || 'Invalid or private link');
        setTitleBgPreview(null);
      }
    } catch (error: any) {
      setTitleBgValidationStatus('error');
      setTitleBgValidationMessage(error.message || 'Invalid or private link');
      setTitleBgPreview(null);
    } finally {
      setTitleBgValidating(false);
    }
  };

  const handleTitleBgSave = async (file: File | null, url: string | null) => {
    try {
      let blob: ExternalBlob;

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        blob = ExternalBlob.fromBytes(uint8Array);
      } else if (url) {
        blob = ExternalBlob.fromURL(url);
      } else {
        return;
      }

      await updateTitleBackground.mutateAsync(blob);
      toast.success('Title background updated successfully!');
    } catch (error: any) {
      console.error('Title background update error:', error);
      toast.error(error.message || 'Failed to update title background');
    }
  };

  const handleTitleBgRemove = async () => {
    try {
      await removeTitleBackground.mutateAsync();
      setTitleBgFile(null);
      setTitleBgUrl('');
      setTitleBgPreview(null);
      setTitleBgValidationStatus('idle');
      setTitleBgValidationMessage('');
      toast.success('Title background removed successfully!');
    } catch (error: any) {
      console.error('Title background remove error:', error);
      toast.error(error.message || 'Failed to remove title background');
    }
  };

  // Static Image Handlers
  const handleStaticImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStaticImageFile(file);
    setStaticImageUrl('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setStaticImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-save
    await handleStaticImageSave(file, null);
  };

  const handleStaticImageUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setStaticImageUrl(url);
    setStaticImageFile(null);

    if (!url.trim()) {
      setStaticImagePreview(null);
      setStaticImageValidationStatus('idle');
      setStaticImageValidationMessage('');
      return;
    }

    // Validate and convert URL
    setStaticImageValidating(true);
    setStaticImageValidationStatus('validating');
    setStaticImageValidationMessage('Validating link...');

    try {
      const convertedUrl = convertToDirectImageUrl(url);
      const result = await validateProxiedImageUrl(convertedUrl, actor);
      
      if (result.valid && result.proxyUrl) {
        setStaticImagePreview(result.proxyUrl);
        setStaticImageValidationStatus('success');
        setStaticImageValidationMessage('Link validated successfully');
        
        // Auto-save
        setTimeout(() => handleStaticImageSave(null, result.proxyUrl || null), 500);
      } else {
        setStaticImageValidationStatus('error');
        setStaticImageValidationMessage(result.error || 'Invalid or private link');
        setStaticImagePreview(null);
      }
    } catch (error: any) {
      setStaticImageValidationStatus('error');
      setStaticImageValidationMessage(error.message || 'Invalid or private link');
      setStaticImagePreview(null);
    } finally {
      setStaticImageValidating(false);
    }
  };

  const handleStaticImageSave = async (file: File | null, url: string | null) => {
    try {
      let blob: ExternalBlob;

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        blob = ExternalBlob.fromBytes(uint8Array);
      } else if (url) {
        blob = ExternalBlob.fromURL(url);
      } else {
        return;
      }

      await updateStaticImage.mutateAsync(blob);
      toast.success('Static image updated successfully!');
    } catch (error: any) {
      console.error('Static image update error:', error);
      toast.error(error.message || 'Failed to update static image');
    }
  };

  const handleStaticImageRemove = async () => {
    try {
      await removeStaticImage.mutateAsync();
      setStaticImageFile(null);
      setStaticImageUrl('');
      setStaticImagePreview(null);
      setStaticImageValidationStatus('idle');
      setStaticImageValidationMessage('');
      toast.success('Static image removed successfully!');
    } catch (error: any) {
      console.error('Static image remove error:', error);
      toast.error(error.message || 'Failed to remove static image');
    }
  };

  if (!identity || !hasPermission) {
    return null;
  }

  if (orgStructureLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-school-blue" />
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button 
            onClick={() => navigate({ to: '/admin/dashboard' })} 
            variant="outline" 
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-school-blue">Organizational Structure Management</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage images for the Organizational Structure page
          </p>
        </div>

        <Tabs defaultValue="title-background" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="title-background">Title Background (600×200)</TabsTrigger>
            <TabsTrigger value="static-image">Static Image (1920×800)</TabsTrigger>
          </TabsList>

          {/* Title Background Tab */}
          <TabsContent value="title-background">
            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-school-blue">Title Background Image</CardTitle>
                <CardDescription>
                  Upload a background image for the page title (recommended: 600×200 px)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="title-bg-file" className="text-[#800000] font-semibold">
                    Upload from Device
                  </Label>
                  <Input
                    id="title-bg-file"
                    type="file"
                    accept="image/*"
                    onChange={handleTitleBgFileChange}
                    disabled={updateTitleBackground.isPending}
                  />
                </div>

                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="title-bg-url" className="text-[#800000] font-semibold">
                    Or Paste External Link
                  </Label>
                  <Input
                    id="title-bg-url"
                    type="url"
                    placeholder="https://drive.google.com/... or other cloud storage URL"
                    value={titleBgUrl}
                    onChange={handleTitleBgUrlChange}
                    disabled={titleBgValidating || updateTitleBackground.isPending}
                  />
                  {titleBgValidationStatus !== 'idle' && (
                    <Alert className={titleBgValidationStatus === 'error' ? 'border-red-500' : ''}>
                      <div className="flex items-center gap-2">
                        {titleBgValidationStatus === 'validating' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {titleBgValidationStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {titleBgValidationStatus === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                        <AlertDescription>{titleBgValidationMessage}</AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>

                {/* Preview */}
                {titleBgPreview && (
                  <div className="space-y-2">
                    <Label className="text-[#800000] font-semibold">Preview</Label>
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-school-gold/20">
                      <img
                        src={titleBgPreview}
                        alt="Title background preview"
                        className="w-full h-full object-cover"
                        onError={() => setTitleBgPreview(null)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="text-center text-white">
                          <h2 className="text-2xl font-bold">Organizational Structure</h2>
                          <p className="text-sm">Meet our leadership team</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleTitleBgRemove}
                      variant="destructive"
                      size="sm"
                      disabled={removeTitleBackground.isPending}
                    >
                      {removeTitleBackground.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        'Remove Background'
                      )}
                    </Button>
                  </div>
                )}

                {updateTitleBackground.isPending && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>Saving title background...</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Static Image Tab */}
          <TabsContent value="static-image">
            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-school-blue">Static Image</CardTitle>
                <CardDescription>
                  Upload a static image to replace the School Leadership section (recommended: 1920×800 px)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="static-image-file" className="text-[#800000] font-semibold">
                    Upload from Device
                  </Label>
                  <Input
                    id="static-image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleStaticImageFileChange}
                    disabled={updateStaticImage.isPending}
                  />
                </div>

                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="static-image-url" className="text-[#800000] font-semibold">
                    Or Paste External Link
                  </Label>
                  <Input
                    id="static-image-url"
                    type="url"
                    placeholder="https://drive.google.com/... or other cloud storage URL"
                    value={staticImageUrl}
                    onChange={handleStaticImageUrlChange}
                    disabled={staticImageValidating || updateStaticImage.isPending}
                  />
                  {staticImageValidationStatus !== 'idle' && (
                    <Alert className={staticImageValidationStatus === 'error' ? 'border-red-500' : ''}>
                      <div className="flex items-center gap-2">
                        {staticImageValidationStatus === 'validating' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {staticImageValidationStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {staticImageValidationStatus === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                        <AlertDescription>{staticImageValidationMessage}</AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>

                {/* Preview */}
                {staticImagePreview && (
                  <div className="space-y-2">
                    <Label className="text-[#800000] font-semibold">Preview</Label>
                    <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-school-gold/20">
                      <img
                        src={staticImagePreview}
                        alt="Static image preview"
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '600px' }}
                        onError={() => setStaticImagePreview(null)}
                      />
                    </div>
                    <Button
                      onClick={handleStaticImageRemove}
                      variant="destructive"
                      size="sm"
                      disabled={removeStaticImage.isPending}
                    >
                      {removeStaticImage.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        'Remove Image'
                      )}
                    </Button>
                  </div>
                )}

                {updateStaticImage.isPending && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>Saving static image...</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
