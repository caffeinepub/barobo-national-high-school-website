import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GPPPage() {
  return (
    <div>
      <PageHeader title="GPP" description="Gulayan sa Paaralan Program" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Gulayan sa Paaralan Program</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The Gulayan sa Paaralan Program (GPP) is our school gardening initiative that promotes food security, nutrition awareness, and environmental stewardship among students and the school community.
              </p>
              <p className="mt-4 leading-relaxed">
                Through hands-on gardening activities, students learn about sustainable agriculture, healthy eating habits, and the importance of environmental conservation while contributing to the school's supplementary feeding program.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
