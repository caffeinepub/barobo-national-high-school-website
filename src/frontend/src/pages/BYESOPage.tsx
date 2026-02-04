import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BYESOPage() {
  return (
    <div>
      <PageHeader title="BYESO" description="Barangay Youth and Education Support Office" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Barangay Youth and Education Support Office</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The Barangay Youth and Education Support Office (BYESO) facilitates collaboration between the school and local barangay units to support youth development and educational initiatives in the community.
              </p>
              <p className="mt-4 leading-relaxed">
                Through partnerships with local government units, we work to provide additional resources, programs, and support services that benefit our students and their families.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
