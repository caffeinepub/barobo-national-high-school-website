import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useGetAlumniContent, 
  useGetAlumniProfiles, 
  useUpdateAlumniContent,
  useCreateAlumniProfile,
  useUpdateAlumniProfile,
  useDeleteAlumniProfile
} from '@/hooks/useQueries';
import { ArrowLeft, AlertCircle, Save, Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function AlumniManagementPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: alumniContent, isLoading: contentLoading } = useGetAlumniContent();
  const { data: alumniProfiles, isLoading: profilesLoading } = useGetAlumniProfiles();
  const updateContent = useUpdateAlumniContent();
  const createProfile = useCreateAlumniProfile();
  const updateProfile = useUpdateAlumniProfile();
  const deleteProfile = useDeleteAlumniProfile();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [communityEngagement, setCommunityEngagement] = useState('');
  const [editingProfile, setEditingProfile] = useState<bigint | null>(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    graduationYear: '',
    achievements: '',
    currentPosition: '',
  });

  // Initialize form when content loads
  useState(() => {
    if (alumniContent) {
      setTitle(alumniContent.title);
      setDescription(alumniContent.description);
      setCommunityEngagement(alumniContent.communityEngagement);
    }
  });

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to access the Alumni Management page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleSaveContent = async () => {
    if (!title.trim() || !description.trim() || !communityEngagement.trim()) {
      toast.error('Please fill in all content fields');
      return;
    }

    try {
      await updateContent.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        communityEngagement: communityEngagement.trim(),
      });
      toast.success('Alumni content updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update alumni content');
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.graduationYear.trim() || 
        !profileForm.achievements.trim() || !profileForm.currentPosition.trim()) {
      toast.error('Please fill in all profile fields');
      return;
    }

    try {
      if (editingProfile !== null) {
        await updateProfile.mutateAsync({
          id: editingProfile,
          name: profileForm.name.trim(),
          graduationYear: profileForm.graduationYear.trim(),
          achievements: profileForm.achievements.trim(),
          currentPosition: profileForm.currentPosition.trim(),
        });
        toast.success('Alumni profile updated successfully!');
      } else {
        await createProfile.mutateAsync({
          name: profileForm.name.trim(),
          graduationYear: profileForm.graduationYear.trim(),
          achievements: profileForm.achievements.trim(),
          currentPosition: profileForm.currentPosition.trim(),
        });
        toast.success('Alumni profile created successfully!');
      }
      setProfileForm({ name: '', graduationYear: '', achievements: '', currentPosition: '' });
      setEditingProfile(null);
      setShowAddProfile(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save alumni profile');
    }
  };

  const handleEditProfile = (profile: any) => {
    setProfileForm({
      name: profile.name,
      graduationYear: profile.graduationYear,
      achievements: profile.achievements,
      currentPosition: profile.currentPosition,
    });
    setEditingProfile(profile.id);
    setShowAddProfile(true);
  };

  const handleDeleteProfile = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this alumni profile?')) return;

    try {
      await deleteProfile.mutateAsync(id);
      toast.success('Alumni profile deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete alumni profile');
    }
  };

  const handleCancelProfile = () => {
    setProfileForm({ name: '', graduationYear: '', achievements: '', currentPosition: '' });
    setEditingProfile(null);
    setShowAddProfile(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate({ to: '/admin/dashboard' })} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-school-blue">Alumni Management</h1>
        </div>

        {/* Alumni Content Section */}
        <Card className="border-school-gold/20 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-school-blue">Alumni Page Content</CardTitle>
            <CardDescription>Edit the main content for the Alumni page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {contentLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter page title"
                    className="border-school-gold/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter page description"
                    rows={4}
                    className="border-school-gold/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communityEngagement">Community Engagement Message</Label>
                  <Textarea
                    id="communityEngagement"
                    value={communityEngagement}
                    onChange={(e) => setCommunityEngagement(e.target.value)}
                    placeholder="Enter community engagement invitation"
                    rows={4}
                    className="border-school-gold/20"
                  />
                </div>

                <Button
                  onClick={handleSaveContent}
                  disabled={updateContent.isPending}
                  className="w-full bg-school-blue hover:bg-school-blue-dark"
                >
                  {updateContent.isPending ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Content
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Alumni Profiles Section */}
        <Card className="border-school-gold/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-school-blue">Alumni Profiles</CardTitle>
                <CardDescription>Manage individual alumni profiles</CardDescription>
              </div>
              <Button
                onClick={() => setShowAddProfile(true)}
                className="bg-school-gold hover:bg-school-gold-dark text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add/Edit Profile Form */}
            {showAddProfile && (
              <Card className="border-school-blue/20 bg-school-blue/5">
                <CardHeader>
                  <CardTitle className="text-lg text-school-blue">
                    {editingProfile !== null ? 'Edit Alumni Profile' : 'Add New Alumni Profile'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="profileName">Name</Label>
                      <Input
                        id="profileName"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Enter alumni name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        value={profileForm.graduationYear}
                        onChange={(e) => setProfileForm({ ...profileForm, graduationYear: e.target.value })}
                        placeholder="e.g., 2020"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPosition">Current Position</Label>
                    <Input
                      id="currentPosition"
                      value={profileForm.currentPosition}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPosition: e.target.value })}
                      placeholder="Enter current position or occupation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievements">Achievements</Label>
                    <Textarea
                      id="achievements"
                      value={profileForm.achievements}
                      onChange={(e) => setProfileForm({ ...profileForm, achievements: e.target.value })}
                      placeholder="Enter notable achievements and accomplishments"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={createProfile.isPending || updateProfile.isPending}
                      className="flex-1 bg-school-blue hover:bg-school-blue-dark"
                    >
                      {createProfile.isPending || updateProfile.isPending ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {editingProfile !== null ? 'Update Profile' : 'Add Profile'}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelProfile}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profiles List */}
            {profilesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : alumniProfiles && alumniProfiles.length > 0 ? (
              <div className="space-y-4">
                {alumniProfiles.map((profile) => (
                  <Card key={Number(profile.id)} className="border-school-gold/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="h-5 w-5 text-school-gold" />
                            <h3 className="text-lg font-semibold text-school-blue">{profile.name}</h3>
                            <span className="text-sm text-muted-foreground">• Class of {profile.graduationYear}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-semibold">Current Position:</span> {profile.currentPosition}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Achievements:</span> {profile.achievements}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => handleEditProfile(profile)}
                            variant="outline"
                            size="sm"
                            className="gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteProfile(profile.id)}
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            disabled={deleteProfile.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alumni profiles yet. Click "Add Profile" to create the first one.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
