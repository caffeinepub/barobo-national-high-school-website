import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Shield, AlertTriangle } from 'lucide-react';

export default function ClubsOrganizationsPage() {
  const clubs = [
    { name: 'Science Club', description: 'Exploring the wonders of science through experiments and research' },
    { name: 'Math Club', description: 'Developing problem-solving skills and mathematical thinking' },
    { name: 'English Club', description: 'Enhancing communication and literary skills' },
    { name: 'Arts Club', description: 'Expressing creativity through various art forms' },
    { name: 'Sports Club', description: 'Promoting physical fitness and sportsmanship' },
    { name: 'Music Club', description: 'Cultivating musical talents and appreciation' },
  ];

  const specialOrganizations = [
    {
      name: 'PAT',
      fullName: 'Parents and Teachers Association',
      description: 'Collaborative partnership between families and school to support student learning and development',
      icon: Users,
    },
    {
      name: 'JDRRA',
      fullName: 'Junior Disaster Risk Reduction and Management',
      description: 'Disaster preparedness training, emergency drills, and response procedures for student safety',
      icon: AlertTriangle,
    },
    {
      name: 'BYESO',
      fullName: 'Barangay Youth and Education Support Office',
      description: 'Collaboration with local government units to support youth development and educational initiatives',
      icon: Shield,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clubs and Organization"
        description="Discover our vibrant student organizations and special programs"
      />
      
      {/* Maroon Background Box Section */}
      <section className="py-16 bg-[#800000]">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold text-white">Student Clubs</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <Card key={club.name} className="border-school-gold/20 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-school-blue">{club.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{club.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold text-school-blue">Special Organizations</h2>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {specialOrganizations.map((org) => {
              const Icon = org.icon;
              return (
                <Card key={org.name} className="border-school-gold/30 shadow-lg">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="h-6 w-6 text-school-gold" />
                      <CardTitle className="text-school-blue">{org.name}</CardTitle>
                    </div>
                    <CardDescription className="text-base font-semibold text-foreground/80">{org.fullName}</CardDescription>
                    <CardDescription className="text-sm mt-2">{org.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
