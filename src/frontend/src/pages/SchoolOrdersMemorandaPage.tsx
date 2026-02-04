import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function SchoolOrdersMemorandaPage() {
  return (
    <div>
      <PageHeader
        title="School Orders/Memoranda"
        description="Official orders and memoranda from the school administration"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">
                School Orders and Memoranda will be posted here as they become available.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
