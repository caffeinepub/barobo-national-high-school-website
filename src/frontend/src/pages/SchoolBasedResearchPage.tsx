import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SchoolBasedResearchPage() {
  return (
    <div>
      <PageHeader
        title="School-Based Research"
        description="Collaborative research initiatives addressing school-wide concerns and opportunities"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">About School-Based Research</CardTitle>
              <CardDescription>Building a culture of inquiry and continuous improvement</CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-lg leading-relaxed">
                School-based research involves collaborative investigations that address institutional challenges and opportunities. These research projects engage multiple stakeholders including administrators, teachers, students, and parents to develop comprehensive solutions.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                Our school-based research initiatives focus on systemic improvements that benefit the entire school community and contribute to our institutional development.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="border-school-blue/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-school-blue">Research Focus Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5">
                  <li>School culture and climate</li>
                  <li>Curriculum development and implementation</li>
                  <li>Student performance and achievement</li>
                  <li>Parent and community engagement</li>
                  <li>School management and governance</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-school-blue">Collaborative Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Multi-stakeholder research teams</li>
                  <li>Data-driven decision making</li>
                  <li>Participatory action research methods</li>
                  <li>Regular monitoring and evaluation</li>
                  <li>Knowledge sharing and dissemination</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
