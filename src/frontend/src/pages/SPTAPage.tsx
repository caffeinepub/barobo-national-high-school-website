import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SPTAPage() {
  return (
    <div>
      <PageHeader title="SPTA" description="School Parent-Teacher Association" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">SPTA</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Information about the School Parent-Teacher Association, its activities, and financial transparency.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
