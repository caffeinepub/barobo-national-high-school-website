import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ESWMPage() {
  return (
    <div>
      <PageHeader title="ESWM" description="Ecological Solid Waste Management" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Ecological Solid Waste Management</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Our Ecological Solid Waste Management (ESWM) program promotes environmental sustainability through proper waste segregation, recycling, and composting practices within the school community.
              </p>
              <p className="mt-4 leading-relaxed">
                Students learn about the importance of waste reduction, environmental conservation, and sustainable practices that they can apply both in school and at home, contributing to a cleaner and healthier environment.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
