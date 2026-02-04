import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function ResearchInnovationsPage() {
  return (
    <div>
      <PageHeader
        title="Research and Innovations"
        description="Showcasing research activities and innovative programs"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">
                Research and innovations content will be available soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
