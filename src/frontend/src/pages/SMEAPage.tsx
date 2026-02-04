import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SMEAPage() {
  return (
    <div>
      <PageHeader title="SMEA" description="School Maintenance and Other Operating Expenses Allocation" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">SMEA</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Transparent reporting of school maintenance and operating expenses allocation and utilization.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
