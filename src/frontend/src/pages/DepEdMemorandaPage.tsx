import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function DepEdMemorandaPage() {
  return (
    <div>
      <PageHeader
        title="DepEd Memoranda"
        description="Official memoranda from the Department of Education"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">
                DepEd Memoranda will be posted here as they become available.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
