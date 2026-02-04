import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ARALProgramPage() {
  return (
    <div>
      <PageHeader title="ARAL Program" description="Accelerated Reading for All Learners" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">ARAL Program</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The ARAL Program focuses on improving reading comprehension and literacy skills across all grade levels, ensuring every student develops strong foundational reading abilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
