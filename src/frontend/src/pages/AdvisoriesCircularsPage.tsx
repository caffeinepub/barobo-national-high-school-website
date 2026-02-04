import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function AdvisoriesCircularsPage() {
  return (
    <div>
      <PageHeader
        title="Advisories/Circulars"
        description="Important advisories and circulars for the school community"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">
                Advisories and Circulars will be posted here as they become available.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
