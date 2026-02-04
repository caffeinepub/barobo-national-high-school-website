import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerRole, useGetCallerPermissions } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image, Images, ArrowLeft, AlertCircle, BookOpen, MapPin, GraduationCap, Video, Users, BarChart3, HardDrive, Building2 } from 'lucide-react';
import { AdminPermission } from '@/backend';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: role, isLoading: roleLoading, isError: roleError } = useGetCallerRole();
  const { data: permissions, isLoading: permissionsLoading } = useGetCallerPermissions();

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to access the admin dashboard. Please log in using the Admin Login button.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (roleLoading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Display role with fallback
  const displayRole = roleError ? 'Unknown' : (role || 'Unknown');
  const isSuperAdmin = role === 'SuperAdmin';
  const hasPermission = (permission: AdminPermission) => {
    return isSuperAdmin || permissions?.includes(permission);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            onClick={() => navigate({ to: '/' })} 
            className="gap-2 bg-[#800000] hover:bg-[#9a0000] text-white border-none"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-school-blue">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Role: <span className="font-semibold text-school-blue">{displayRole}</span>
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* User Management Card - Super Admin Only */}
          {isSuperAdmin && (
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-school-blue/10 p-3">
                    <Users className="h-6 w-6 text-school-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-school-blue">User Management</CardTitle>
                    <CardDescription>Manage admin users and permissions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create and manage Admin User accounts, assign permissions, and control access to different content management areas.
                </p>
                <Button 
                  onClick={() => navigate({ to: '/admin/user-management' })}
                  className="w-full bg-[#800000] hover:bg-[#9a0000] text-white border-none"
                >
                  <Users className="h-4 w-4 mr-2 text-white" />
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Analytics Dashboard Card - Admin Only */}
          {isSuperAdmin && (
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-school-gold/10 p-3">
                    <BarChart3 className="h-6 w-6 text-school-gold" />
                  </div>
                  <div>
                    <CardTitle className="text-school-blue">Analytics Dashboard</CardTitle>
                    <CardDescription>View visitor and login statistics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track visitor analytics, login activity, and view detailed statistics with interactive charts and time period filters.
                </p>
                <Button 
                  onClick={() => navigate({ to: '/admin/analytics' })}
                  className="w-full bg-[#800000] hover:bg-[#9a0000] text-white border-none"
                >
                  <BarChart3 className="h-4 w-4 mr-2 text-white" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Storage Monitor Card - Admin Only */}
          {isSuperAdmin && (
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-school-blue/10 p-3">
                    <HardDrive className="h-6 w-6 text-school-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-school-blue">Storage Monitor</CardTitle>
                    <CardDescription>Monitor storage usage and capacity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View storage capacity, usage statistics, file type breakdown, and manage storage optimization.
                </p>
                <Button 
                  onClick={() => navigate({ to: '/admin/storage' })}
                  className="w-full bg-[#800000] hover:bg-[#9a0000] text-white border-none"
                >
                  <HardDrive className="h-4 w-4 mr-2 text-white" />
                  View Storage
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Banner Management Card */}
          {hasPermission(AdminPermission.ManageBanners) && (
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-school-blue/10 p-3">
                    <Image className="h-6 w-6 text-school-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-school-blue">Banner Management</CardTitle>
                    <CardDescription>Manage website banner images</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload and manage the banner image displayed at the top of all pages. Supports JPG, PNG, and animated GIF formats.
                </p>
                <Button 
                  onClick={() => navigate({ to: '/admin/banner-management' })}
                  className="w-full bg-[#800000] hover:bg-[#9a0000] text-white border-none"
                >
                  <Image className="h-4 w-4 mr-2 text-white" />
                  Manage Banner
                </Button>
              </CardContent>
            </Card>
          )}

          {/* School Activities Manager Card */}
          {hasPermission(AdminPermission.ManageSlider) && (
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-school-gold/10 p-3">
                    <Images className="h-6 w-6 text-school-gold" />
                  </div>
                  <div>
                    <CardTitle className="text-school-blue">School Activities Manager</CardTitle>
                    <CardDescription>Manage homepage slider images</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload, edit, and organize images for the School Activities slider on the homepage. Add photos from your device or external links.
                </p>
                <Button 
                  onClick={() => navigate({ to: '/admin/school-activities-manager' })}
                  className="w-full bg-[#800000] hover:bg-[#9a0000] text-white border-none"
                >
                  <Images className="h-4 w-4 mr-2 text-white" />
                  Manage School Activities
                </Button>
              </CardContent>
            </Card>
          )}

          {/* History Management Card */}
          {hasPermission(AdminPermission.ManageHeritage) && (
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-school-blue/10 p-3">
                    <BookOpen className="h-6 w-6 text-school-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-school-blue">History Management</CardTitle>
                    <CardDescription>Manage History page content</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Edit the Heritage Section title, text content, and background image for the History page. Changes appear instantly on the live site.
                </p>
                <Button 
                  onClick={() => navigate({ to: '/admin/history-management' })}
                  className="w-full bg-[#800000] hover:bg-[#9a0000] text-white border-none"
                >
                  <BookOpen className="h-4 w-4 mr-2 text-white" />
                  Manage History
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Organizational Structure Management Card */}
          {hasPermission(AdminPermission.ManageHeritage) && (
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-school-gold/10 p-3">
                    <Building2 className="h-6 w-6 text-school-gold" />
                  </div>
                  <div>
                    <CardTitle className="text-school-blue">Organizational Structure</CardTitle>
                    <CardDescription>Manage org structure images</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload and manage the title background and static image for the Organizational Structure page.
                </p>
                <Button 
                  onClick={() => navigate({ to: '/admin/organizational-structure-management' })}
                  className="w-full bg-[#800000] hover:bg-[#9a0000] text-white border-none"
                >
                  <Building2 className="h-4 w-4 mr-2 text-white" />
                  Manage Org Structure
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Citizen Charter Management Card */}
          {hasPermission(AdminPermission.ManageCitizenCharter) && (
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-school-blue/10 p-3">
                    <MapPin className="h-6 w-6 text-school-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-school-blue">Citizen Charter Management</CardTitle>
                    <CardDescription>Manage contact page background</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload and manage the background image for the Citizen Charter contact information card. Defaults to maroon theme color.
                </p>
                <Button 
                  onClick={() => navigate({ to: '/admin/citizen-charter-management' })}
                  className="w-full bg-[#800000] hover:bg-[#9a0000] text-white border-none"
                >
                  <MapPin className="h-4 w-4 mr-2 text-white" />
                  Manage Citizen Charter
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Alumni Management Card */}
          {hasPermission(AdminPermission.ManageAlumni) && (
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-school-gold/10 p-3">
                    <GraduationCap className="h-6 w-6 text-school-gold" />
                  </div>
                  <div>
                    <CardTitle className="text-school-blue">Alumni Management</CardTitle>
                    <CardDescription>Manage Alumni page content</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Edit Alumni page content, manage alumni profiles, achievements, and community engagement invitations.
                </p>
                <Button 
                  onClick={() => navigate({ to: '/admin/alumni-management' })}
                  className="w-full bg-[#800000] hover:bg-[#9a0000] text-white border-none"
                >
                  <GraduationCap className="h-4 w-4 mr-2 text-white" />
                  Manage Alumni
                </Button>
              </CardContent>
            </Card>
          )}

          {/* BNHS Hymn Management Card */}
          {hasPermission(AdminPermission.ManageHymn) && (
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-school-blue/10 p-3">
                    <Video className="h-6 w-6 text-school-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-school-blue">BNHS Hymn Management</CardTitle>
                    <CardDescription>Manage school hymn video</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload and manage the BNHS Hymn video displayed on the homepage. Supports device uploads and external video links.
                </p>
                <Button 
                  onClick={() => navigate({ to: '/admin/bnhs-hymn-management' })}
                  className="w-full bg-[#800000] hover:bg-[#9a0000] text-white border-none"
                >
                  <Video className="h-4 w-4 mr-2 text-white" />
                  Manage BNHS Hymn
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {!isSuperAdmin && permissions && permissions.length === 0 && (
          <Alert className="max-w-2xl mx-auto mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have any permissions assigned yet. Please contact the Super Admin to grant you access to content management areas.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
