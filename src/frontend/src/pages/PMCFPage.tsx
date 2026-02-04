import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PMCFPage() {
  return (
    <div>
      <PageHeader title="PMCF" description="Performance Management and Competency Framework" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">PMCF</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The Performance Management and Competency Framework guides teacher evaluation and professional development.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
