import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChildProtectionPolicyPage() {
  return (
    <div>
      <PageHeader title="Child Protection Policy" description="Ensuring the safety and welfare of our students" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Child Protection Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                Our Child Protection Policy is designed to create a safe and nurturing environment for all students. We are committed to protecting children from all forms of abuse, exploitation, violence, and discrimination.
              </p>
              <p className="mt-4 leading-relaxed">
                This policy outlines our procedures for preventing, identifying, and responding to child protection concerns, ensuring that the best interests of the child are always paramount.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
