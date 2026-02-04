import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PhysicalEvaluationPage() {
  return (
    <div>
      <PageHeader title="Physical Evaluation" description="Facility and infrastructure assessment" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Physical Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Regular evaluation of school facilities and infrastructure to ensure safe and conducive learning environments.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
