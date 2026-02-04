import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function DownloadableFormsPage() {
  const forms = [
    { name: 'Enrollment Form', description: 'Official enrollment form for new and returning students' },
    { name: 'Brigada Eskwela Sheet', description: 'Volunteer registration for Brigada Eskwela program' },
    { name: '4P\'s Form', description: 'Pantawid Pamilyang Pilipino Program documentation' },
    { name: 'Anecdotal Records', description: 'Student behavior and incident documentation' },
    { name: 'Student Handbook', description: 'Complete guide to school policies and procedures' },
    { name: 'SF2 (Daily Attendance Report)', description: 'Student attendance tracking form' },
    { name: 'SF3 (School Form 3)', description: 'Learner\'s permanent record' },
    { name: 'SARDO Form', description: 'School and Division Records Officer documentation' },
  ];

  return (
    <div>
      <PageHeader
        title="Downloadable School Forms"
        description="Access important school forms and documents"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2">
            {forms.map((form) => (
              <Card key={form.name} className="border-school-gold/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-school-blue">{form.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">{form.description}</p>
                  <Button className="bg-school-blue hover:bg-school-blue-dark">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Early Registration Link</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Register early for the upcoming school year through our online enrollment system.
              </p>
              <Button className="bg-school-gold hover:bg-school-gold-dark text-school-blue">
                Go to Registration Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
