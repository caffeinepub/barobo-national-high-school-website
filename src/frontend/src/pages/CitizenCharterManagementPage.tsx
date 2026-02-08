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
  useGetContactInfoSections,
  useCreateContactInfoSection,
  useUpdateContactInfoSection,
  useDeleteContactInfoSection,
  useGetOfficeHoursSections,
  useCreateOfficeHoursSection,
  useUpdateOfficeHoursSection,
  useDeleteOfficeHoursSection,
  useGetSchoolHoursSections,
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
  const { data: contactInfoSections = [], isLoading: isLoadingContactInfo } = useGetContactInfoSections();
  const { data: officeHoursSections = [], isLoading: isLoadingOfficeHours } = useGetOfficeHoursSections();
  const { data: schoolHoursSections = [], isLoading: isLoadingSchoolHours } = useGetSchoolHoursSections();

  const updateBackgroundMutation = useUpdateCitizenCharterBackground();
  const removeBackgroundMutation = useRemoveCitizenCharterBackground();
  const updateStaticImageMutation = useUpdateCitizenCharterStaticImage();
  const removeStaticImageMutation = useRemoveCitizenCharterStaticImage();

  const createContactInfoMutation = useCreateContactInfoSection();
  const updateContactInfoMutation = useUpdateContactInfoSection();
  const deleteContactInfoMutation = useDeleteContactInfoSection();

  const createOfficeHoursMutation = useCreateOfficeHoursSection();
  const updateOfficeHoursMutation = useUpdateOfficeHoursSection();
  const deleteOfficeHoursMutation = useDeleteOfficeHoursSection();

  const createSchoolHoursMutation = useCreateSchoolHoursSection();
  const updateSchoolHoursMutation = useUpdateSchoolHoursSection();
  const deleteSchoolHoursMutation = useDeleteSchoolHoursSection();

  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [backgroundUploadMode, setBackgroundUploadMode] = useState<'file' | 'url'>('file');
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [isValidatingBackground, setIsValidatingBackground] = useState(false);

  const [staticImageFile, setStaticImageFile] = useState<File | null>(null);
  const [staticImageUrl, setStaticImageUrl] = useState('');
  const [staticImageUploadMode, setStaticImageUploadMode] = useState<'file' | 'url'>('file');
  const [staticImagePreview, setStaticImagePreview] = useState<string | null>(null);
  const [isValidatingStaticImage, setIsValidatingStaticImage] = useState(false);

  const [editingContactInfo, setEditingContactInfo] = useState<{ id: bigint; content: string } | null>(null);
  const [newContactInfo, setNewContactInfo] = useState('');

  const [editingOfficeHours, setEditingOfficeHours] = useState<{ id: bigint; content: string } | null>(null);
  const [newOfficeHours, setNewOfficeHours] = useState('');

  const [editingSchoolHours, setEditingSchoolHours] = useState<{ id: bigint; content: string } | null>(null);
  const [newSchoolHours, setNewSchoolHours] = useState('');

  useEffect(() => {
    if (backgroundData?.backgroundImage) {
      const url = backgroundData.backgroundImage.getDirectURL();
      setBackgroundPreview(url);
    }
  }, [backgroundData]);

  useEffect(() => {
    if (staticImageData?.staticImage) {
      const url = staticImageData.staticImage.getDirectURL();
      setStaticImagePreview(url);
    }
  }, [staticImageData]);

  useEffect(() => {
    if (backgroundUploadMode === 'url' && backgroundUrl.trim()) {
      const timeoutId = setTimeout(async () => {
        setIsValidatingBackground(true);
        const directUrl = convertToDirectImageUrl(backgroundUrl);
        const validation = await validateProxiedImageUrl(directUrl);
        setIsValidatingBackground(false);

        if (validation.valid) {
          setBackgroundPreview(directUrl);
        } else {
          setBackgroundPreview(null);
          toast.error(validation.error || 'Failed to validate background URL');
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (backgroundUploadMode === 'url') {
      setBackgroundPreview(null);
    }
  }, [backgroundUrl, backgroundUploadMode]);

  useEffect(() => {
    if (staticImageUploadMode === 'url' && staticImageUrl.trim()) {
      const timeoutId = setTimeout(async () => {
        setIsValidatingStaticImage(true);
        const directUrl = convertToDirectImageUrl(staticImageUrl);
        const validation = await validateProxiedImageUrl(directUrl);
        setIsValidatingStaticImage(false);

        if (validation.valid) {
          setStaticImagePreview(directUrl);
        } else {
          setStaticImagePreview(null);
          toast.error(validation.error || 'Failed to validate static image URL');
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (staticImageUploadMode === 'url') {
      setStaticImagePreview(null);
    }
  }, [staticImageUrl, staticImageUploadMode]);

  const handleBackgroundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setBackgroundFile(file);
        const objectUrl = URL.createObjectURL(file);
        setBackgroundPreview(objectUrl);
      } else {
        toast.error('Please select a valid image file');
        setBackgroundFile(null);
        setBackgroundPreview(null);
      }
    }
  };

  const handleStaticImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setStaticImageFile(file);
        const objectUrl = URL.createObjectURL(file);
        setStaticImagePreview(objectUrl);
      } else {
        toast.error('Please select a valid image file');
        setStaticImageFile(null);
        setStaticImagePreview(null);
      }
    }
  };

  const handleUploadBackground = async () => {
    try {
      if (backgroundUploadMode === 'file' && backgroundFile) {
        const arrayBuffer = await backgroundFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        await updateBackgroundMutation.mutateAsync(blob);
        toast.success('Background image uploaded successfully ✅');
        setBackgroundFile(null);
      } else if (backgroundUploadMode === 'url' && backgroundUrl.trim()) {
        const directUrl = convertToDirectImageUrl(backgroundUrl);
        const blob = ExternalBlob.fromURL(directUrl);
        await updateBackgroundMutation.mutateAsync(blob);
        toast.success('Background image from external link uploaded successfully ✅');
        setBackgroundUrl('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload background image');
    }
  };

  const handleRemoveBackground = async () => {
    if (window.confirm('Are you sure you want to remove the background image?')) {
      try {
        await removeBackgroundMutation.mutateAsync();
        toast.success('Background image removed successfully ✅');
        setBackgroundPreview(null);
      } catch (error: any) {
        toast.error(error.message || 'Failed to remove background image');
      }
    }
  };

  const handleUploadStaticImage = async () => {
    try {
      if (staticImageUploadMode === 'file' && staticImageFile) {
        const arrayBuffer = await staticImageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        await updateStaticImageMutation.mutateAsync(blob);
        toast.success('Static image uploaded successfully ✅');
        setStaticImageFile(null);
      } else if (staticImageUploadMode === 'url' && staticImageUrl.trim()) {
        const directUrl = convertToDirectImageUrl(staticImageUrl);
        const blob = ExternalBlob.fromURL(directUrl);
        await updateStaticImageMutation.mutateAsync(blob);
        toast.success('Static image from external link uploaded successfully ✅');
        setStaticImageUrl('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload static image');
    }
  };

  const handleRemoveStaticImage = async () => {
    if (window.confirm('Are you sure you want to remove the static image?')) {
      try {
        await removeStaticImageMutation.mutateAsync();
        toast.success('Static image removed successfully ✅');
        setStaticImagePreview(null);
      } catch (error: any) {
        toast.error(error.message || 'Failed to remove static image');
      }
    }
  };

  const handleCreateContactInfo = async () => {
    if (!newContactInfo.trim()) {
      toast.error('Please enter contact information');
      return;
    }
    try {
      await createContactInfoMutation.mutateAsync(newContactInfo);
      toast.success('Contact information added successfully ✅');
      setNewContactInfo('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add contact information');
    }
  };

  const handleUpdateContactInfo = async () => {
    if (!editingContactInfo) return;
    try {
      await updateContactInfoMutation.mutateAsync({
        id: editingContactInfo.id,
        content: editingContactInfo.content,
      });
      toast.success('Contact information updated successfully ✅');
      setEditingContactInfo(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update contact information');
    }
  };

  const handleDeleteContactInfo = async (id: bigint) => {
    if (window.confirm('Are you sure you want to delete this contact information?')) {
      try {
        await deleteContactInfoMutation.mutateAsync(id);
        toast.success('Contact information deleted successfully ✅');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete contact information');
      }
    }
  };

  const handleCreateOfficeHours = async () => {
    if (!newOfficeHours.trim()) {
      toast.error('Please enter office hours');
      return;
    }
    try {
      await createOfficeHoursMutation.mutateAsync(newOfficeHours);
      toast.success('Office hours added successfully ✅');
      setNewOfficeHours('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add office hours');
    }
  };

  const handleUpdateOfficeHours = async () => {
    if (!editingOfficeHours) return;
    try {
      await updateOfficeHoursMutation.mutateAsync({
        id: editingOfficeHours.id,
        content: editingOfficeHours.content,
      });
      toast.success('Office hours updated successfully ✅');
      setEditingOfficeHours(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update office hours');
    }
  };

  const handleDeleteOfficeHours = async (id: bigint) => {
    if (window.confirm('Are you sure you want to delete this office hours entry?')) {
      try {
        await deleteOfficeHoursMutation.mutateAsync(id);
        toast.success('Office hours deleted successfully ✅');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete office hours');
      }
    }
  };

  const handleCreateSchoolHours = async () => {
    if (!newSchoolHours.trim()) {
      toast.error('Please enter school hours');
      return;
    }
    try {
      await createSchoolHoursMutation.mutateAsync(newSchoolHours);
      toast.success('School hours added successfully ✅');
      setNewSchoolHours('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add school hours');
    }
  };

  const handleUpdateSchoolHours = async () => {
    if (!editingSchoolHours) return;
    try {
      await updateSchoolHoursMutation.mutateAsync({
        id: editingSchoolHours.id,
        content: editingSchoolHours.content,
      });
      toast.success('School hours updated successfully ✅');
      setEditingSchoolHours(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update school hours');
    }
  };

  const handleDeleteSchoolHours = async (id: bigint) => {
    if (window.confirm('Are you sure you want to delete this school hours entry?')) {
      try {
        await deleteSchoolHoursMutation.mutateAsync(id);
        toast.success('School hours deleted successfully ✅');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete school hours');
      }
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to access the Citizen Charter management page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            onClick={() => navigate({ to: '/admin/dashboard' })} 
            className="gap-2 bg-[#800000] hover:bg-[#9a0000] text-white"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-school-blue">Citizen Charter Management</h1>
        </div>

        <Tabs defaultValue="contact-info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contact-info">Contact Info</TabsTrigger>
            <TabsTrigger value="office-hours">Office Hours</TabsTrigger>
            <TabsTrigger value="school-hours">School Hours</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="contact-info" className="space-y-6">
            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-school-blue flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Manage contact information sections displayed on the Citizen Charter page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-contact-info" className="text-[#800000] font-semibold">
                    Add New Contact Information
                  </Label>
                  <Textarea
                    id="new-contact-info"
                    placeholder="Enter contact information (e.g., phone numbers, email addresses, physical address)..."
                    value={newContactInfo}
                    onChange={(e) => setNewContactInfo(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={handleCreateContactInfo}
                    disabled={createContactInfoMutation.isPending || !newContactInfo.trim()}
                    className="w-full bg-[#800000] hover:bg-[#9a0000] text-white"
                  >
                    {createContactInfoMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contact Information
                      </>
                    )}
                  </Button>
                </div>

                {isLoadingContactInfo ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-school-maroon" />
                  </div>
                ) : contactInfoSections.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-school-blue">Existing Contact Information</h3>
                    {contactInfoSections.map((section) => (
                      <Card key={section.id.toString()} className="border-school-gold/10">
                        <CardContent className="pt-6">
                          {editingContactInfo?.id === section.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingContactInfo.content}
                                onChange={(e) =>
                                  setEditingContactInfo({ ...editingContactInfo, content: e.target.value })
                                }
                                rows={4}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleUpdateContactInfo}
                                  disabled={updateContactInfoMutation.isPending}
                                  className="flex-1 bg-[#800000] hover:bg-[#9a0000] text-white"
                                >
                                  {updateContactInfoMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save Changes
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => setEditingContactInfo(null)}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="whitespace-pre-wrap">{section.content}</p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    setEditingContactInfo({ id: section.id, content: section.content })
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleDeleteContactInfo(section.id)}
                                  disabled={deleteContactInfoMutation.isPending}
                                  variant="destructive"
                                  size="sm"
                                  className="flex-1"
                                >
                                  {deleteContactInfoMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted p-8 text-center">
                    <p className="text-muted-foreground">
                      No contact information sections yet. Add one above to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="office-hours" className="space-y-6">
            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-school-blue flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Office Hours
                </CardTitle>
                <CardDescription>
                  Manage office hours information displayed on the Citizen Charter page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-office-hours" className="text-[#800000] font-semibold">
                    Add New Office Hours
                  </Label>
                  <Textarea
                    id="new-office-hours"
                    placeholder="Enter office hours (e.g., Monday - Friday: 8:00 AM - 5:00 PM)..."
                    value={newOfficeHours}
                    onChange={(e) => setNewOfficeHours(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={handleCreateOfficeHours}
                    disabled={createOfficeHoursMutation.isPending || !newOfficeHours.trim()}
                    className="w-full bg-[#800000] hover:bg-[#9a0000] text-white"
                  >
                    {createOfficeHoursMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Office Hours
                      </>
                    )}
                  </Button>
                </div>

                {isLoadingOfficeHours ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-school-maroon" />
                  </div>
                ) : officeHoursSections.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-school-blue">Existing Office Hours</h3>
                    {officeHoursSections.map((section) => (
                      <Card key={section.id.toString()} className="border-school-gold/10">
                        <CardContent className="pt-6">
                          {editingOfficeHours?.id === section.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingOfficeHours.content}
                                onChange={(e) =>
                                  setEditingOfficeHours({ ...editingOfficeHours, content: e.target.value })
                                }
                                rows={4}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleUpdateOfficeHours}
                                  disabled={updateOfficeHoursMutation.isPending}
                                  className="flex-1 bg-[#800000] hover:bg-[#9a0000] text-white"
                                >
                                  {updateOfficeHoursMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save Changes
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => setEditingOfficeHours(null)}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="whitespace-pre-wrap">{section.content}</p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    setEditingOfficeHours({ id: section.id, content: section.content })
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleDeleteOfficeHours(section.id)}
                                  disabled={deleteOfficeHoursMutation.isPending}
                                  variant="destructive"
                                  size="sm"
                                  className="flex-1"
                                >
                                  {deleteOfficeHoursMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted p-8 text-center">
                    <p className="text-muted-foreground">
                      No office hours sections yet. Add one above to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="school-hours" className="space-y-6">
            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-school-blue flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  School Hours
                </CardTitle>
                <CardDescription>
                  Manage school hours information displayed on the Citizen Charter page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-school-hours" className="text-[#800000] font-semibold">
                    Add New School Hours
                  </Label>
                  <Textarea
                    id="new-school-hours"
                    placeholder="Enter school hours (e.g., Classes: 7:30 AM - 3:30 PM)..."
                    value={newSchoolHours}
                    onChange={(e) => setNewSchoolHours(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={handleCreateSchoolHours}
                    disabled={createSchoolHoursMutation.isPending || !newSchoolHours.trim()}
                    className="w-full bg-[#800000] hover:bg-[#9a0000] text-white"
                  >
                    {createSchoolHoursMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add School Hours
                      </>
                    )}
                  </Button>
                </div>

                {isLoadingSchoolHours ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-school-maroon" />
                  </div>
                ) : schoolHoursSections.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-school-blue">Existing School Hours</h3>
                    {schoolHoursSections.map((section) => (
                      <Card key={section.id.toString()} className="border-school-gold/10">
                        <CardContent className="pt-6">
                          {editingSchoolHours?.id === section.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingSchoolHours.content}
                                onChange={(e) =>
                                  setEditingSchoolHours({ ...editingSchoolHours, content: e.target.value })
                                }
                                rows={4}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleUpdateSchoolHours}
                                  disabled={updateSchoolHoursMutation.isPending}
                                  className="flex-1 bg-[#800000] hover:bg-[#9a0000] text-white"
                                >
                                  {updateSchoolHoursMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save Changes
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => setEditingSchoolHours(null)}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="whitespace-pre-wrap">{section.content}</p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    setEditingSchoolHours({ id: section.id, content: section.content })
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleDeleteSchoolHours(section.id)}
                                  disabled={deleteSchoolHoursMutation.isPending}
                                  variant="destructive"
                                  size="sm"
                                  className="flex-1"
                                >
                                  {deleteSchoolHoursMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted p-8 text-center">
                    <p className="text-muted-foreground">
                      No school hours sections yet. Add one above to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-school-blue flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Title Background Image
                </CardTitle>
                <CardDescription>
                  Upload a background image for the Citizen Charter page title section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={backgroundUploadMode === 'file' ? 'default' : 'outline'}
                    onClick={() => setBackgroundUploadMode('file')}
                    className={backgroundUploadMode === 'file' ? 'bg-school-maroon hover:bg-school-maroon-dark' : ''}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    variant={backgroundUploadMode === 'url' ? 'default' : 'outline'}
                    onClick={() => setBackgroundUploadMode('url')}
                    className={backgroundUploadMode === 'url' ? 'bg-school-maroon hover:bg-school-maroon-dark' : ''}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    External Link
                  </Button>
                </div>

                {backgroundUploadMode === 'file' ? (
                  <div className="space-y-2">
                    <Label htmlFor="background-file">Select Background Image</Label>
                    <Input
                      id="background-file"
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="background-url">Background Image URL</Label>
                    <Input
                      id="background-url"
                      type="url"
                      placeholder="Paste Google Drive, OneDrive, or Dropbox image link..."
                      value={backgroundUrl}
                      onChange={(e) => setBackgroundUrl(e.target.value)}
                    />
                    {isValidatingBackground && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validating...
                      </div>
                    )}
                  </div>
                )}

                {backgroundPreview && (
                  <div className="rounded-lg overflow-hidden border border-school-gold/20">
                    <img
                      src={backgroundPreview}
                      alt="Background preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleUploadBackground}
                    disabled={
                      updateBackgroundMutation.isPending ||
                      (backgroundUploadMode === 'file' && !backgroundFile) ||
                      (backgroundUploadMode === 'url' && (!backgroundUrl.trim() || isValidatingBackground))
                    }
                    className="flex-1 bg-[#800000] hover:bg-[#9a0000] text-white"
                  >
                    {updateBackgroundMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Background
                      </>
                    )}
                  </Button>
                  {backgroundData?.backgroundImage && (
                    <Button
                      onClick={handleRemoveBackground}
                      disabled={removeBackgroundMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      {removeBackgroundMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Background
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-school-blue flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Static Image
                </CardTitle>
                <CardDescription>
                  Upload a static image to display on the Citizen Charter page (recommended: 1248×800 px)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={staticImageUploadMode === 'file' ? 'default' : 'outline'}
                    onClick={() => setStaticImageUploadMode('file')}
                    className={staticImageUploadMode === 'file' ? 'bg-school-maroon hover:bg-school-maroon-dark' : ''}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    variant={staticImageUploadMode === 'url' ? 'default' : 'outline'}
                    onClick={() => setStaticImageUploadMode('url')}
                    className={staticImageUploadMode === 'url' ? 'bg-school-maroon hover:bg-school-maroon-dark' : ''}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    External Link
                  </Button>
                </div>

                {staticImageUploadMode === 'file' ? (
                  <div className="space-y-2">
                    <Label htmlFor="static-image-file">Select Static Image</Label>
                    <Input
                      id="static-image-file"
                      type="file"
                      accept="image/*"
                      onChange={handleStaticImageFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="static-image-url">Static Image URL</Label>
                    <Input
                      id="static-image-url"
                      type="url"
                      placeholder="Paste Google Drive, OneDrive, or Dropbox image link..."
                      value={staticImageUrl}
                      onChange={(e) => setStaticImageUrl(e.target.value)}
                    />
                    {isValidatingStaticImage && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validating...
                      </div>
                    )}
                  </div>
                )}

                {staticImagePreview && (
                  <div className="rounded-lg overflow-hidden border border-school-gold/20">
                    <img
                      src={staticImagePreview}
                      alt="Static image preview"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleUploadStaticImage}
                    disabled={
                      updateStaticImageMutation.isPending ||
                      (staticImageUploadMode === 'file' && !staticImageFile) ||
                      (staticImageUploadMode === 'url' && (!staticImageUrl.trim() || isValidatingStaticImage))
                    }
                    className="flex-1 bg-[#800000] hover:bg-[#9a0000] text-white"
                  >
                    {updateStaticImageMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Static Image
                      </>
                    )}
                  </Button>
                  {staticImageData?.staticImage && (
                    <Button
                      onClick={handleRemoveStaticImage}
                      disabled={removeStaticImageMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      {removeStaticImageMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Static Image
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
