import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LessonPlanPage() {
  return (
    <div>
      <PageHeader title="Lesson Plan/DLL" description="Daily Lesson Logs and Planning" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Lesson Plan/DLL</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Guidelines and templates for preparing effective lesson plans and daily lesson logs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
