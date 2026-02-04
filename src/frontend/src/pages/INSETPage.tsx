import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function INSETPage() {
  return (
    <div>
      <PageHeader title="INSET" description="In-Service Training for Teachers" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">In-Service Training</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                INSET provides continuous professional development opportunities for our teachers, ensuring they stay updated with the latest pedagogical approaches and educational innovations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
