import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TOsPage() {
  return (
    <div>
      <PageHeader title="TOs" description="Teaching Observations" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Teaching Observations</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Structured teaching observations to assess instructional effectiveness and provide developmental feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
