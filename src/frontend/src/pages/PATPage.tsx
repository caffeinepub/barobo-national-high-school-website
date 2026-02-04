import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PATPage() {
  return (
    <div>
      <PageHeader title="PAT" description="Parents and Teachers Association" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Parents and Teachers Association</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The Parents and Teachers Association (PAT) serves as a vital link between the school and families. Through collaborative efforts, we work together to support student learning, enhance school programs, and strengthen the school community.
              </p>
              <p className="mt-4 leading-relaxed">
                PAT organizes various activities, fundraising events, and volunteer programs that contribute to the overall development and improvement of our school.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
