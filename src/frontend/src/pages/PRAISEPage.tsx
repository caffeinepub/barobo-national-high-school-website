import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PRAISEPage() {
  return (
    <div>
      <PageHeader title="PRAISE" description="Program on Awards and Incentives for Services Excellence" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">PRAISE Program</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The PRAISE program recognizes and rewards outstanding performance and service excellence among faculty and staff, fostering a culture of excellence and continuous improvement.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
