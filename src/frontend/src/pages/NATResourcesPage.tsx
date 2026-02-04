import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NATResourcesPage() {
  return (
    <div>
      <PageHeader title="NAT Resources" description="National Achievement Test preparation materials" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">NAT Resources</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Resources and materials to help students prepare for the National Achievement Test, including practice tests and study guides.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
