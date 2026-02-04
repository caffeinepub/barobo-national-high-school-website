import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetAlumniContent, useGetAlumniProfiles } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, GraduationCap, Award, Users } from 'lucide-react';

export default function AlumniPage() {
  const { data: alumniContent, isLoading: contentLoading, error: contentError } = useGetAlumniContent();
  const { data: alumniProfiles, isLoading: profilesLoading, error: profilesError } = useGetAlumniProfiles();

  return (
    <div>
      <PageHeader
        title="Alumni"
        description="Celebrating our distinguished graduates and fostering community connections"
      />
      
      {/* Main Content Section with Maroon Background */}
      <section className="py-16 bg-[#800000]">
        <div className="container mx-auto px-4">
          {contentLoading ? (
            <Card className="border-school-gold/20 shadow-lg bg-white">
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ) : contentError ? (
            <Alert variant="destructive" className="bg-white">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {contentError instanceof Error && contentError.message.includes('No Alumni content found')
                  ? 'Alumni content has not been added yet. Please check back later.'
                  : 'Failed to load alumni content. Please try again later.'}
              </AlertDescription>
            </Alert>
          ) : alumniContent ? (
            <div className="space-y-8">
              <Card className="border-school-gold/20 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-3xl text-school-blue">{alumniContent.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed text-foreground/90 mb-6">
                    {alumniContent.description}
                  </p>
                  
                  <div className="mt-8 rounded-lg bg-school-gold/10 p-6 border border-school-gold/20">
                    <div className="flex items-start gap-3">
                      <Users className="h-6 w-6 text-school-gold mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-school-blue mb-2">Community Engagement</h3>
                        <p className="text-foreground/80 leading-relaxed">
                          {alumniContent.communityEngagement}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </section>

      {/* Alumni Profiles Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-school-blue mb-2">Distinguished Alumni</h2>
            <p className="text-muted-foreground">Celebrating the achievements of our graduates</p>
          </div>

          {profilesLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-school-gold/20 shadow-lg">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : profilesError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load alumni profiles. Please try again later.
              </AlertDescription>
            </Alert>
          ) : alumniProfiles && alumniProfiles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {alumniProfiles.map((profile) => (
                <Card key={Number(profile.id)} className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-5 w-5 text-school-gold" />
                      <CardTitle className="text-school-blue">{profile.name}</CardTitle>
                    </div>
                    <CardDescription className="font-semibold">
                      Class of {profile.graduationYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-school-blue mb-1">Current Position</p>
                      <p className="text-sm text-muted-foreground">{profile.currentPosition}</p>
                    </div>
                    <div>
                      <div className="flex items-start gap-2">
                        <Award className="h-4 w-4 text-school-gold mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-school-blue mb-1">Achievements</p>
                          <p className="text-sm text-muted-foreground">{profile.achievements}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-school-gold/20 shadow-lg">
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No alumni profiles have been added yet. Check back soon to see our distinguished graduates!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
