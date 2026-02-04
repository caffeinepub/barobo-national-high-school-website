import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SchoolHealthPage() {
  return (
    <div>
      <PageHeader title="School Health and Nutrition Programs" description="Promoting student health and wellness" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Health and Nutrition Programs</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Our comprehensive health and nutrition programs ensure the physical well-being of students through regular health screenings, feeding programs, and health education.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
