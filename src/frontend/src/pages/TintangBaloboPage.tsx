import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function TintangBaloboPage() {
  return (
    <div>
      <PageHeader
        title="Tintang Balobo"
        description="School publication featuring student voices and stories"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">
                Content for Tintang Balobo will be available soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
