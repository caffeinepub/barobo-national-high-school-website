import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ObservationToolsPage() {
  return (
    <div>
      <PageHeader title="CO's/Fleeting/Walkthrough Observation Tools" description="Classroom observation instruments" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Observation Tools</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Various observation tools and instruments used for monitoring classroom instruction and providing constructive feedback to teachers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
