import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function JDRRAPage() {
  return (
    <div>
      <PageHeader title="JDRRA" description="Junior Disaster Risk Reduction and Management" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Junior Disaster Risk Reduction and Management</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="leading-relaxed">
                The Junior Disaster Risk Reduction and Management (JDRRA) program prepares our students to respond effectively to natural disasters and emergencies. Through training and drills, students develop essential skills in disaster preparedness and response.
              </p>
              <p className="mt-4 leading-relaxed">
                Our program includes earthquake drills, fire safety training, first aid instruction, and emergency evacuation procedures, ensuring that our school community is ready to face any crisis situation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
