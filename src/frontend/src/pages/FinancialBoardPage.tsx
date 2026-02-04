import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FinancialBoardPage() {
  return (
    <div>
      <PageHeader title="Financial Board" description="Financial transparency and accountability" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Financial Board</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Transparent reporting of school finances, budget allocation, and expenditures in accordance with government regulations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
