import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SBMPage() {
  return (
    <div>
      <PageHeader title="SBM" description="School-Based Management" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">School-Based Management</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                SBM empowers the school community to participate in decision-making processes, promoting transparency, accountability, and collaborative governance.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
