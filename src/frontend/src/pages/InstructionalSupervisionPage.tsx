import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InstructionalSupervisionPage() {
  return (
    <div>
      <PageHeader title="Instructional Supervision" description="Monitoring and improving teaching quality" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Instructional Supervision</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Instructional supervision ensures quality teaching through regular classroom observations, feedback sessions, and professional development support for teachers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
