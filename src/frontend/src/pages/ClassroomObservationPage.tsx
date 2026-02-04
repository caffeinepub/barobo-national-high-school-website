import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClassroomObservationPage() {
  return (
    <div>
      <PageHeader title="Classroom Observation" description="Monitoring teaching effectiveness" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Classroom Observation</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Regular classroom observations help identify teaching strengths and areas for improvement, supporting professional growth.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
