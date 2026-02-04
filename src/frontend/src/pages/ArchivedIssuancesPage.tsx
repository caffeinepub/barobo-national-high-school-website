import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function ArchivedIssuancesPage() {
  return (
    <div>
      <PageHeader
        title="Archived Issuances"
        description="Historical records of past issuances and documents"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">
                Archived issuances will be available here for reference.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
