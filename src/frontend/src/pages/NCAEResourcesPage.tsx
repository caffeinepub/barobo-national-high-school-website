import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NCAEResourcesPage() {
  return (
    <div>
      <PageHeader title="NCAE Resources" description="National Career Assessment Examination materials" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">NCAE Resources</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Resources for the National Career Assessment Examination to help students identify their career interests and aptitudes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
