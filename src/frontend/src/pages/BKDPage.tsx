import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BKDPage() {
  return (
    <div>
      <PageHeader title="BKD" description="Bawat Bata Bumabasa" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Bawat Bata Bumabasa (BKD)</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The Bawat Bata Bumabasa (BKD) program is our literacy initiative aimed at ensuring that every child develops strong reading skills. We believe that reading is the foundation of all learning and essential for academic success.
              </p>
              <p className="mt-4 leading-relaxed">
                Through reading programs, library activities, and literacy interventions, we work to cultivate a love for reading and improve reading comprehension among all our students.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
