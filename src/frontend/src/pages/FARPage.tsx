import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FARPage() {
  return (
    <div>
      <PageHeader title="FAR" description="Field Assistance Report" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Field Assistance Report</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Documentation of field assistance visits and support provided to teachers and departments.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
