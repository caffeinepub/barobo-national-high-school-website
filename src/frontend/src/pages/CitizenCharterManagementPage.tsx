import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Upload, AlertCircle, Loader2, Image as ImageIcon, Trash2, Eye, Edit, Save, Plus, Info } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { 
  useGetCitizenCharterBackground, 
  useUpdateCitizenCharterBackground, 
  useRemoveCitizenCharterBackground, 
  useGetCitizenCharterStaticImage, 
  useUpdateCitizenCharterStaticImage, 
  useRemoveCitizenCharterStaticImage,
  useGetAllContactInfoSections,
  useCreateContactInfoSection,
  useUpdateContactInfoSection,
  useDeleteContactInfoSection,
  useGetAllOfficeHoursSections,
  useCreateOfficeHoursSection,
  useUpdateOfficeHoursSection,
  useDeleteOfficeHoursSection,
  useGetAllSchoolHoursSections,
  useCreateSchoolHoursSection,
  useUpdateSchoolHoursSection,
  useDeleteSchoolHoursSection
} from '@/hooks/useQueries';
import { convertToDirectImageUrl } from '@/lib/urlConverter';
import { validateProxiedImageUrl } from '@/lib/imageProxy';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CitizenCharterManagementPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: backgroundData, isLoading: isLoadingBackground } = useGetCitizenCharterBackground();
  const { data: staticImageData, isLoading: isLoadingStaticImage } = useGetCitizenCharterStaticImage();
  const updateBackgroundMutation = useUpdateCitizenCharterBackground();
  const removeBackgroundMutation = useRemoveCitizenCharterBackground();
  const updateStaticImageMutation = useUpdateCitizenCharterStaticImage();
  const removeStaticImageMutation = useRemoveCitizenCharterStaticImage();

  // Contact Info CRUD
  const { data: contactInfoSections = [] } = useGetAllContactInfoSections();
  const createContactInfoMutation = useCreateContactInfoSection();
  const updateContactInfoMutation = useUpdateContactInfoSection();
  const deleteContactInfoMutation = useDeleteContactInfoSection();

  // Office Hours CRUD
  const { data: officeHoursSections = [] } = useGetAllOfficeHoursSections();
  const createOfficeHoursMutation = useCreateOfficeHoursSection();
  const updateOfficeHoursMutation = useUpdateOfficeHoursSection();
  const deleteOfficeHoursMutation = useDeleteOfficeHoursSection();

  // School Hours CRUD
  const { data: schoolHoursSections = [] } = useGetAllSchoolHoursSections();
  const createSchoolHoursMutation = useCreateSchoolHoursSection();
  const updateSchoolHoursMutation = useUpdateSchoolHoursSection();
  const deleteSchoolHoursMutation = useDeleteSchoolHoursSection();

  // Background image state
  const [selectedBgFile, setSelectedBgFile] = useState<File | null>(null);
  const [previewBgUrl, setPreviewBgUrl] = useState<string>('');
  const [externalBgUrl, setExternalBgUrl] = useState('');
  const [isValidatingBg, setIsValidatingBg] = useState(false);
  const [validationBgError, setValidationBgError] = useState('');
  const [uploadBgProgress, setUploadBgProgress] = useState(0);

  // Static image state
  const [selectedStaticFile, setSelectedStaticFile] = useState<File | null>(null);
  const [previewStaticUrl, setPreviewStaticUrl] = useState<string>('');
  const [externalStaticUrl, setExternalStaticUrl] = useState('');
  const [isValidatingStatic, setIsValidatingStatic] = useState(false);
  const [validationStaticError, setValidationStaticError] = useState('');
  const [uploadStaticProgress, setUploadStaticProgress] = useState(0);

  // Contact Info state
  const [newContactInfo, setNewContactInfo] = useState('');
  const [editingContactInfo, setEditingContactInfo] = useState<bigint | null>(null);
  const [editContactInfoContent, setEditContactInfoContent] = useState('');

  // Office Hours state
  const [newOfficeHours, setNewOfficeHours] = useState('');
  const [editingOfficeHours, setEditingOfficeHours] = useState<bigint | null>(null);
  const [editOfficeHoursContent, setEditOfficeHoursContent] = useState('');

  // School Hours state
  const [newSchoolHours, setNewSchoolHours] = useState('');
  const [editingSchoolHours, setEditingSchoolHours] = useState<bigint | null>(null);
  const [editSchoolHoursContent, setEditSchoolHoursContent] = useState('');

  const currentBackgroundUrl = backgroundData?.backgroundImage?.getDirectURL();
  const hasCurrentBackground = backgroundData?.isActive && currentBackgroundUrl;

  const currentStaticImageUrl = staticImageData?.staticImage?.getDirectURL();
  const hasCurrentStaticImage = currentStaticImageUrl;

  // Background URL validation
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const validateUrl = async () => {
      if (!externalBgUrl.trim()) return;

      setIsValidatingBg(true);
      setValidationBgError('');

      try {
        const convertedUrl = convertToDirectImageUrl(externalBgUrl.trim());
        const validation = await validateProxiedImageUrl(convertedUrl);

        if (validation.valid) {
          setPreviewBgUrl(convertedUrl);
          setValidationBgError('');
        } else {
          setValidationBgError(validation.error || 'Unable to access the image. Please check the URL and sharing permissions.');
          setPreviewBgUrl('');
        }
      } catch (error: any) {
        setValidationBgError(error.message || 'Failed to validate image URL');
        setPreviewBgUrl('');
      } finally {
        setIsValidatingBg(false);
      }
    };

    if (externalBgUrl.trim()) {
      timeoutId = setTimeout(validateUrl, 300);
    } else {
      setPreviewBgUrl('');
      setValidationBgError('');
      setIsValidatingBg(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [externalBgUrl]);

  // Static image URL validation
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const validateUrl = async () => {
      if (!externalStaticUrl.trim()) return;

      setIsValidatingStatic(true);
      setValidationStaticError('');

      try {
        const convertedUrl = convertToDirectImageUrl(externalStaticUrl.trim());
        const validation = await validateProxiedImageUrl(convertedUrl);

        if (validation.valid) {
          setPreviewStaticUrl(convertedUrl);
          setValidationStaticError('');
        } else {
          setValidationStaticError(validation.error || 'Unable to access the image. Please check the URL and sharing permissions.');
          setPreviewStaticUrl('');
        }
      } catch (error: any) {
        setValidationStaticError(error.message || 'Failed to validate image URL');
        setPreviewStaticUrl('');
      } finally {
        setIsValidatingStatic(false);
      }
    };

    if (externalStaticUrl.trim()) {
      timeoutId = setTimeout(validateUrl, 300);
    } else {
      setPreviewStaticUrl('');
      setValidationStaticError('');
      setIsValidatingStatic(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [externalStaticUrl]);

  const handleBgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setSelectedBgFile(file);
      setPreviewBgUrl(URL.createObjectURL(file));
      setExternalBgUrl('');
      setValidationBgError('');
    }
  };

  const handleStaticFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setSelectedStaticFile(file);
      setPreviewStaticUrl(URL.createObjectURL(file));
      setExternalStaticUrl('');
      setValidationStaticError('');
    }
  };

  const handleUploadBackground = async () => {
    try {
      let blob: ExternalBlob;

      if (selectedBgFile) {
        const arrayBuffer = await selectedBgFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadBgProgress(percentage);
        });
      } else if (previewBgUrl) {
        blob = ExternalBlob.fromURL(previewBgUrl);
      } else {
        toast.error('Please select an image or provide a valid URL');
        return;
      }

      await updateBackgroundMutation.mutateAsync(blob);
      
      toast.success('Title/subtitle background image updated successfully!');
      setSelectedBgFile(null);
      setPreviewBgUrl('');
      setExternalBgUrl('');
      setUploadBgProgress(0);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload background image');
    }
  };

  const handleUploadStaticImage = async () => {
    try {
      let blob: ExternalBlob;

      if (selectedStaticFile) {
        const arrayBuffer = await selectedStaticFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadStaticProgress(percentage);
        });
      } else if (previewStaticUrl) {
        blob = ExternalBlob.fromURL(previewStaticUrl);
      } else {
        toast.error('Please select an image or provide a valid URL');
        return;
      }

      await updateStaticImageMutation.mutateAsync(blob);
      
      toast.success('Static image updated successfully!');
      setSelectedStaticFile(null);
      setPreviewStaticUrl('');
      setExternalStaticUrl('');
      setUploadStaticProgress(0);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload static image');
    }
  };

  const handleRemoveBackground = async () => {
    if (!confirm('Are you sure you want to remove the background image? The title/subtitle area will display with the default background.')) {
      return;
    }

    try {
      await removeBackgroundMutation.mutateAsync();
      toast.success('Background image removed successfully!');
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error(error.message || 'Failed to remove background image');
    }
  };

  const handleRemoveStaticImage = async () => {
    if (!confirm('Are you sure you want to remove the static image?')) {
      return;
    }

    try {
      await removeStaticImageMutation.mutateAsync();
      toast.success('Static image removed successfully!');
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error(error.message || 'Failed to remove static image');
    }
  };

  // Contact Info handlers
  const handleCreateContactInfo = async () => {
    if (!newContactInfo.trim()) {
      toast.error('Please enter contact information');
      return;
    }

    try {
      await createContactInfoMutation.mutateAsync(newContactInfo);
      toast.success('Contact Information created successfully ✅');
      setNewContactInfo('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contact information');
    }
  };

  const handleSaveContactInfoChanges = async (id: bigint) => {
    if (!editContactInfoContent.trim()) {
      toast.error('Please enter contact information');
      return;
    }

    try {
      await updateContactInfoMutation.mutateAsync({ id, content: editContactInfoContent });
      toast.success('Changes saved successfully ✅');
      setEditingContactInfo(null);
      setEditContactInfoContent('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save changes');
    }
  };

  const handleDeleteContactInfo = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this contact information entry?')) {
      return;
    }

    try {
      await deleteContactInfoMutation.mutateAsync(id);
      toast.success('Deleted successfully 🗑️');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contact information');
    }
  };

  // Office Hours handlers
  const handleCreateOfficeHours = async () => {
    if (!newOfficeHours.trim()) {
      toast.error('Please enter office hours');
      return;
    }

    try {
      await createOfficeHoursMutation.mutateAsync(newOfficeHours);
      toast.success('Office Hours created successfully ✅');
      setNewOfficeHours('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create office hours');
    }
  };

  const handleSaveOfficeHoursChanges = async (id: bigint) => {
    if (!editOfficeHoursContent.trim()) {
      toast.error('Please enter office hours');
      return;
    }

    try {
      await updateOfficeHoursMutation.mutateAsync({ id, content: editOfficeHoursContent });
      toast.success('Changes saved successfully ✅');
      setEditingOfficeHours(null);
      setEditOfficeHoursContent('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save changes');
    }
  };

  const handleDeleteOfficeHours = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this office hours entry?')) {
      return;
    }

    try {
      await deleteOfficeHoursMutation.mutateAsync(id);
      toast.success('Deleted successfully 🗑️');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete office hours');
    }
  };

  // School Hours handlers
  const handleCreateSchoolHours = async () => {
    if (!newSchoolHours.trim()) {
      toast.error('Please enter school hours');
      return;
    }

    try {
      await createSchoolHoursMutation.mutateAsync(newSchoolHours);
      toast.success('School Hours created successfully ✅');
      setNewSchoolHours('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create school hours');
    }
  };

  const handleSaveSchoolHoursChanges = async (id: bigint) => {
    if (!editSchoolHoursContent.trim()) {
      toast.error('Please enter school hours');
      return;
    }

    try {
      await updateSchoolHoursMutation.mutateAsync({ id, content: editSchoolHoursContent });
      toast.success('Changes saved successfully ✅');
      setEditingSchoolHours(null);
      setEditSchoolHoursContent('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save changes');
    }
  };

  const handleDeleteSchoolHours = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this school hours entry?')) {
      return;
    }

    try {
      await deleteSchoolHoursMutation.mutateAsync(id);
      toast.success('Deleted successfully 🗑️');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete school hours');
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to access the Citizen Charter Management page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const isUploadingBg = updateBackgroundMutation.isPending || removeBackgroundMutation.isPending;
  const isUploadingStatic = updateStaticImageMutation.isPending || removeStaticImageMutation.isPending;
  const canUploadBg = (selectedBgFile || previewBgUrl) && !isValidatingBg && !validationBgError;
  const canUploadStatic = (selectedStaticFile || previewStaticUrl) && !isValidatingStatic && !validationStaticError;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate({ to: '/admin/dashboard' })} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-school-blue">Citizen Charter Management</h1>
          </div>

          <Tabs defaultValue="contact-info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contact-info">Contact Info</TabsTrigger>
              <TabsTrigger value="office-hours">Office Hours</TabsTrigger>
              <TabsTrigger value="school-hours">School Hours</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            {/* Contact Info Tab */}
            <TabsContent value="contact-info" className="space-y-6">
              <Card className="border-school-gold/20 shadow-lg" style={{ backgroundColor: '#800000' }}>
                <CardHeader>
                  <CardTitle className="text-white">Contact Information Management</CardTitle>
                  <CardDescription className="text-white/90">
                    Create, edit, and delete contact information entries (phone numbers, email addresses)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Create New Entry */}
                  <div className="space-y-4 p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label className="text-white font-semibold text-base" style={{ color: '#800000' }}>
                        <span className="text-white">Contact Information</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-white/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Enter phone numbers, email addresses, and other contact details for the school</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      placeholder="Enter school contact information here... (e.g., Phone: (086) 850-0113, Email: school@example.com)"
                      value={newContactInfo}
                      onChange={(e) => setNewContactInfo(e.target.value)}
                      rows={4}
                      className="bg-white text-gray-900"
                      aria-label="Contact information input"
                    />
                    <Button
                      onClick={handleCreateContactInfo}
                      disabled={createContactInfoMutation.isPending}
                      className="w-full bg-white text-maroon hover:bg-gray-100 gap-2"
                    >
                      {createContactInfoMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Create Entry
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Existing Entries */}
                  <div className="space-y-4">
                    <Label className="text-white font-semibold">Existing Entries</Label>
                    {contactInfoSections.length === 0 ? (
                      <p className="text-white/70 text-center py-4">No contact information entries yet</p>
                    ) : (
                      contactInfoSections.map((section) => (
                        <div key={section.id.toString()} className="p-4 bg-white/10 rounded-lg space-y-3">
                          {editingContactInfo === section.id ? (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <Label className="text-white font-semibold">Contact Information</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-white/70 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Edit the contact information content</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Textarea
                                placeholder="Enter school contact information here..."
                                value={editContactInfoContent}
                                onChange={(e) => setEditContactInfoContent(e.target.value)}
                                rows={4}
                                className="bg-white text-gray-900"
                                aria-label="Edit contact information"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSaveContactInfoChanges(section.id)}
                                  disabled={updateContactInfoMutation.isPending}
                                  className="flex-1 gap-2"
                                  style={{ backgroundColor: '#800000', color: 'white' }}
                                >
                                  {updateContactInfoMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4" />
                                      Save Changes
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingContactInfo(null);
                                    setEditContactInfoContent('');
                                  }}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-white whitespace-pre-wrap">{section.content}</p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setEditingContactInfo(section.id);
                                    setEditContactInfoContent(section.content);
                                  }}
                                  className="flex-1 bg-white text-maroon hover:bg-gray-100 gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleDeleteContactInfo(section.id)}
                                  disabled={deleteContactInfoMutation.isPending}
                                  variant="destructive"
                                  className="flex-1 gap-2"
                                >
                                  {deleteContactInfoMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Office Hours Tab */}
            <TabsContent value="office-hours" className="space-y-6">
              <Card className="border-school-gold/20 shadow-lg" style={{ backgroundColor: '#800000' }}>
                <CardHeader>
                  <CardTitle className="text-white">Office Hours Management</CardTitle>
                  <CardDescription className="text-white/90">
                    Create, edit, and delete office hours entries
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Create New Entry */}
                  <div className="space-y-4 p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label className="text-white font-semibold text-base">Office Hours</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-white/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Enter the school office operating hours (e.g., Monday-Friday 8:00 AM - 5:00 PM)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      placeholder="Enter office hours here... (e.g., Monday - Friday 8:00 A.M. - 5:00 P.M.)"
                      value={newOfficeHours}
                      onChange={(e) => setNewOfficeHours(e.target.value)}
                      rows={4}
                      className="bg-white text-gray-900"
                      aria-label="Office hours input"
                    />
                    <Button
                      onClick={handleCreateOfficeHours}
                      disabled={createOfficeHoursMutation.isPending}
                      className="w-full bg-white text-maroon hover:bg-gray-100 gap-2"
                    >
                      {createOfficeHoursMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Create Entry
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Existing Entries */}
                  <div className="space-y-4">
                    <Label className="text-white font-semibold">Existing Entries</Label>
                    {officeHoursSections.length === 0 ? (
                      <p className="text-white/70 text-center py-4">No office hours entries yet</p>
                    ) : (
                      officeHoursSections.map((section) => (
                        <div key={section.id.toString()} className="p-4 bg-white/10 rounded-lg space-y-3">
                          {editingOfficeHours === section.id ? (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <Label className="text-white font-semibold">Office Hours</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-white/70 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Edit the office hours content</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Textarea
                                placeholder="Enter office hours here..."
                                value={editOfficeHoursContent}
                                onChange={(e) => setEditOfficeHoursContent(e.target.value)}
                                rows={4}
                                className="bg-white text-gray-900"
                                aria-label="Edit office hours"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSaveOfficeHoursChanges(section.id)}
                                  disabled={updateOfficeHoursMutation.isPending}
                                  className="flex-1 gap-2"
                                  style={{ backgroundColor: '#800000', color: 'white' }}
                                >
                                  {updateOfficeHoursMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4" />
                                      Save Changes
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingOfficeHours(null);
                                    setEditOfficeHoursContent('');
                                  }}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-white whitespace-pre-wrap">{section.content}</p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setEditingOfficeHours(section.id);
                                    setEditOfficeHoursContent(section.content);
                                  }}
                                  className="flex-1 bg-white text-maroon hover:bg-gray-100 gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleDeleteOfficeHours(section.id)}
                                  disabled={deleteOfficeHoursMutation.isPending}
                                  variant="destructive"
                                  className="flex-1 gap-2"
                                >
                                  {deleteOfficeHoursMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* School Hours Tab */}
            <TabsContent value="school-hours" className="space-y-6">
              <Card className="border-school-gold/20 shadow-lg" style={{ backgroundColor: '#800000' }}>
                <CardHeader>
                  <CardTitle className="text-white">School Hours Management</CardTitle>
                  <CardDescription className="text-white/90">
                    Create, edit, and delete school hours entries
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Create New Entry */}
                  <div className="space-y-4 p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label className="text-white font-semibold text-base">School Hours</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-white/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Enter the school class hours for JHS and SHS (e.g., JHS: 7:15 AM - 5:00 PM, SHS: 7:30 AM - 5:00 PM)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      placeholder="Enter school hours here... (e.g., For JHS: Monday - Friday 7:15 A.M. - 5:00 P.M.)"
                      value={newSchoolHours}
                      onChange={(e) => setNewSchoolHours(e.target.value)}
                      rows={4}
                      className="bg-white text-gray-900"
                      aria-label="School hours input"
                    />
                    <Button
                      onClick={handleCreateSchoolHours}
                      disabled={createSchoolHoursMutation.isPending}
                      className="w-full bg-white text-maroon hover:bg-gray-100 gap-2"
                    >
                      {createSchoolHoursMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Create Entry
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Existing Entries */}
                  <div className="space-y-4">
                    <Label className="text-white font-semibold">Existing Entries</Label>
                    {schoolHoursSections.length === 0 ? (
                      <p className="text-white/70 text-center py-4">No school hours entries yet</p>
                    ) : (
                      schoolHoursSections.map((section) => (
                        <div key={section.id.toString()} className="p-4 bg-white/10 rounded-lg space-y-3">
                          {editingSchoolHours === section.id ? (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <Label className="text-white font-semibold">School Hours</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-white/70 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Edit the school hours content</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Textarea
                                placeholder="Enter school hours here..."
                                value={editSchoolHoursContent}
                                onChange={(e) => setEditSchoolHoursContent(e.target.value)}
                                rows={4}
                                className="bg-white text-gray-900"
                                aria-label="Edit school hours"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSaveSchoolHoursChanges(section.id)}
                                  disabled={updateSchoolHoursMutation.isPending}
                                  className="flex-1 gap-2"
                                  style={{ backgroundColor: '#800000', color: 'white' }}
                                >
                                  {updateSchoolHoursMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4" />
                                      Save Changes
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingSchoolHours(null);
                                    setEditSchoolHoursContent('');
                                  }}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-white whitespace-pre-wrap">{section.content}</p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setEditingSchoolHours(section.id);
                                    setEditSchoolHoursContent(section.content);
                                  }}
                                  className="flex-1 bg-white text-maroon hover:bg-gray-100 gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleDeleteSchoolHours(section.id)}
                                  disabled={deleteSchoolHoursMutation.isPending}
                                  variant="destructive"
                                  className="flex-1 gap-2"
                                >
                                  {deleteSchoolHoursMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <Tabs defaultValue="static-image" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="static-image">Static Image</TabsTrigger>
                  <TabsTrigger value="title-background">Title Background</TabsTrigger>
                </TabsList>

                {/* Static Image Sub-Tab */}
                <TabsContent value="static-image" className="space-y-6">
                  {hasCurrentStaticImage && (
                    <Card className="border-school-gold/20 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-school-blue">Current Static Image</CardTitle>
                        <CardDescription>The image currently displayed below the header banner</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg border border-school-gold/20 bg-gray-50">
                          <img
                            src={`${currentStaticImageUrl}?t=${Date.now()}`}
                            alt="Current Citizen Charter Static"
                            className="w-full h-auto max-w-full object-contain"
                            style={{ display: 'block' }}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          onClick={handleRemoveStaticImage}
                          disabled={isUploadingStatic}
                          className="mt-4 gap-2"
                        >
                          {removeStaticImageMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Remove Static Image
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-school-gold/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-school-blue">Upload Static Image</CardTitle>
                      <CardDescription>
                        Upload an image that will appear below the header banner. Recommended size: 1248×800 px.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="static-file-upload">Upload from Device</Label>
                        <Input
                          id="static-file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleStaticFileSelect}
                          disabled={isUploadingStatic}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="static-external-url">Or Paste External Link</Label>
                        <Input
                          id="static-external-url"
                          type="url"
                          placeholder="Paste Google Drive, OneDrive, or Dropbox link..."
                          value={externalStaticUrl}
                          onChange={(e) => setExternalStaticUrl(e.target.value)}
                          disabled={isUploadingStatic || !!selectedStaticFile}
                        />
                        {isValidatingStatic && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Validating...
                          </p>
                        )}
                        {validationStaticError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{validationStaticError}</AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {previewStaticUrl && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-school-blue" />
                            <Label className="text-school-blue font-semibold">Live Preview</Label>
                          </div>
                          <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg border-2 border-school-gold/30 shadow-md bg-gray-50">
                            <img
                              src={previewStaticUrl}
                              alt="Static Image Preview"
                              className="w-full h-auto max-w-full object-contain"
                              style={{ display: 'block' }}
                            />
                          </div>
                        </div>
                      )}

                      {uploadStaticProgress > 0 && uploadStaticProgress < 100 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadStaticProgress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-school-blue transition-all duration-300"
                              style={{ width: `${uploadStaticProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleUploadStaticImage}
                        disabled={!canUploadStatic || isUploadingStatic}
                        className="w-full bg-school-blue hover:bg-school-blue-dark gap-2"
                      >
                        {isUploadingStatic ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Static Image
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Title Background Sub-Tab */}
                <TabsContent value="title-background" className="space-y-6">
                  {hasCurrentBackground && (
                    <Card className="border-school-gold/20 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-school-blue">Current Title/Subtitle Background</CardTitle>
                        <CardDescription>The background image currently displayed behind the page title</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-school-gold/20">
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-school-blue to-school-blue-dark"
                            style={{
                              backgroundImage: `linear-gradient(rgba(0, 51, 102, 0.85), rgba(0, 51, 102, 0.85)), url(${currentBackgroundUrl}?t=${Date.now()})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                              Citizen Charter
                            </h2>
                            <p className="text-lg md:text-xl text-white/90">
                              School address and contact information
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={handleRemoveBackground}
                          disabled={isUploadingBg}
                          className="mt-4 gap-2"
                        >
                          {removeBackgroundMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Remove Background
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-school-gold/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-school-blue">Upload Title/Subtitle Background</CardTitle>
                      <CardDescription>
                        Upload an image that will appear behind the "Citizen Charter" title and subtitle.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="bg-file-upload">Upload from Device</Label>
                        <Input
                          id="bg-file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleBgFileSelect}
                          disabled={isUploadingBg}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bg-external-url">Or Paste External Link</Label>
                        <Input
                          id="bg-external-url"
                          type="url"
                          placeholder="Paste Google Drive, OneDrive, or Dropbox link..."
                          value={externalBgUrl}
                          onChange={(e) => setExternalBgUrl(e.target.value)}
                          disabled={isUploadingBg || !!selectedBgFile}
                        />
                        {isValidatingBg && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Validating...
                          </p>
                        )}
                        {validationBgError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{validationBgError}</AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {previewBgUrl && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-school-blue" />
                            <Label className="text-school-blue font-semibold">Live Preview</Label>
                          </div>
                          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border-2 border-school-gold/30 shadow-md">
                            <div
                              className="absolute inset-0 bg-gradient-to-r from-school-blue to-school-blue-dark"
                              style={{
                                backgroundImage: `linear-gradient(rgba(0, 51, 102, 0.85), rgba(0, 51, 102, 0.85)), url(${previewBgUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Citizen Charter
                              </h2>
                              <p className="text-lg md:text-xl text-white/90">
                                School address and contact information
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {uploadBgProgress > 0 && uploadBgProgress < 100 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadBgProgress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-school-blue transition-all duration-300"
                              style={{ width: `${uploadBgProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleUploadBackground}
                        disabled={!canUploadBg || isUploadingBg}
                        className="w-full bg-school-blue hover:bg-school-blue-dark gap-2"
                      >
                        {isUploadingBg ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Background
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}

