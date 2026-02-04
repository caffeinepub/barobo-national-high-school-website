import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BrigadaEskwelaPage() {
  return (
    <div>
      <PageHeader title="Brigada Eskwela" description="School maintenance and improvement program" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Brigada Eskwela</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Brigada Eskwela is our annual nationwide voluntary program that brings together stakeholders to prepare schools for the opening of classes. Through community participation, we maintain and improve our facilities to provide better learning environments for our students.
              </p>
              <p className="mt-4 leading-relaxed">
                We recognize and celebrate the contributions of volunteers, partners, and donors who make this program successful each year.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
