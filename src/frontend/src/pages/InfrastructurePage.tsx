import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InfrastructurePage() {
  return (
    <div>
      <PageHeader title="Infrastructure and Facilities" description="School buildings and facilities development" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Infrastructure and Facilities</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Our ongoing infrastructure development ensures modern, safe, and conducive learning environments for all students and staff.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
