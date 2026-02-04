import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResearchOutputsPage() {
  return (
    <div>
      <PageHeader
        title="Research Outputs"
        description="Published research findings and innovative solutions from our school community"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Research Publications and Outputs</CardTitle>
              <CardDescription>Sharing knowledge and best practices</CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-lg leading-relaxed">
                Our research outputs showcase the innovative work of our teachers and staff in addressing educational challenges and improving student outcomes. These publications contribute to the broader educational community and demonstrate our commitment to evidence-based practice.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                Research outputs are disseminated through various channels including academic journals, conferences, workshops, and institutional publications.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="border-school-blue/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-school-blue">Types of Outputs</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Research papers and articles</li>
                  <li>Best practice guides and manuals</li>
                  <li>Instructional materials and resources</li>
                  <li>Conference presentations</li>
                  <li>Policy recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-school-blue">Impact and Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Division and regional recognition</li>
                  <li>Implementation in other schools</li>
                  <li>Professional development contributions</li>
                  <li>Academic citations and references</li>
                  <li>Awards and commendations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
