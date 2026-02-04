import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrefectOfDisciplinePage() {
  return (
    <div>
      <PageHeader title="Prefect of Discipline" description="Maintaining order and promoting positive behavior" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Prefect of Discipline</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The Prefect of Discipline office is responsible for maintaining a safe, orderly, and conducive learning environment. We implement positive discipline strategies that promote student responsibility, respect, and self-regulation.
              </p>
              <p className="mt-4 leading-relaxed">
                Our approach focuses on restorative practices, character development, and helping students understand the consequences of their actions while supporting their growth and development.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
