import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WINSPage() {
  return (
    <div>
      <PageHeader title="WINS" description="War on Illiteracy through Numeracy and Literacy Skills" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">WINS Program</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The War on Illiteracy through Numeracy and Literacy Skills (WINS) program is our comprehensive initiative to address learning gaps and improve foundational skills in reading, writing, and mathematics among our students.
              </p>
              <p className="mt-4 leading-relaxed">
                Through targeted interventions, remedial classes, and innovative teaching strategies, we aim to ensure that every student achieves proficiency in these essential competencies.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
