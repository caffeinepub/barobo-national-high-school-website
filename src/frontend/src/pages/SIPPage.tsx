import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SIPPage() {
  return (
    <div>
      <PageHeader title="SIP" description="School Improvement Plan" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">School Improvement Plan</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The School Improvement Plan outlines our strategic initiatives and goals for continuous enhancement of educational quality, facilities, and student outcomes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
