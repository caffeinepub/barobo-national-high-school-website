import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeartHandshake, BookOpen, Users, Stethoscope, Briefcase, GraduationCap } from 'lucide-react';

export default function SupportServicesPage() {
  const services = [
    {
      title: 'Guidance and Counseling',
      description: 'Professional guidance services for academic, personal, and career development of students',
      icon: HeartHandshake,
    },
    {
      title: 'Library Services',
      description: 'Access to learning resources, research materials, and reading programs',
      icon: BookOpen,
    },
    {
      title: 'Student Welfare',
      description: 'Programs and services ensuring student well-being, safety, and holistic development',
      icon: Users,
    },
    {
      title: 'Health Services',
      description: 'School clinic, health monitoring, and wellness programs for students and staff',
      icon: Stethoscope,
    },
    {
      title: 'Career Guidance',
      description: 'Career counseling, job placement assistance, and industry partnerships',
      icon: Briefcase,
    },
    {
      title: 'Learning Support',
      description: 'Remedial classes, tutoring programs, and academic intervention services',
      icon: GraduationCap,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Support Services"
        description="Comprehensive support services for student success and well-being"
      />
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              Barobo National High School provides a wide range of support services designed to help students 
              achieve their full potential academically, socially, and personally. Our dedicated staff is 
              committed to ensuring every student receives the assistance they need.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="border-school-gold/20 shadow-lg transition-shadow hover:shadow-xl">
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-school-blue/10">
                      <Icon className="h-6 w-6 text-school-blue" />
                    </div>
                    <CardTitle className="text-school-blue">{service.title}</CardTitle>
                    <CardDescription className="mt-2">{service.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 rounded-lg bg-school-blue/5 p-8">
            <h3 className="mb-4 text-2xl font-bold text-school-blue">Contact Support Services</h3>
            <p className="mb-4 text-muted-foreground">
              For inquiries about our support services, please visit the school office or contact us during office hours.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM</p>
              <p><strong>Location:</strong> Main Building, Ground Floor</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
