import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MDLFeedbackPage() {
  return (
    <div>
      <PageHeader title="MDL Feedback and MOV's" description="Modular Distance Learning feedback and means of verification" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">MDL Feedback and MOV's</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Feedback mechanisms and means of verification for Modular Distance Learning implementation and effectiveness.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
