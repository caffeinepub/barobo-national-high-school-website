import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SOSAPage() {
  return (
    <div>
      <PageHeader title="SOSA" description="School Operations and School Administration" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">School Operations and School Administration</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                SOSA encompasses the comprehensive management and operational aspects of the school, ensuring efficient administration and quality service delivery to all stakeholders.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
