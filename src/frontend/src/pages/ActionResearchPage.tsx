import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ActionResearchPage() {
  return (
    <div>
      <PageHeader
        title="Action Research"
        description="Teacher-led research to improve classroom practices and student learning outcomes"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">About Action Research</CardTitle>
              <CardDescription>Empowering teachers through reflective practice</CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-lg leading-relaxed">
                Action research is a systematic approach to investigating and improving teaching practices. Our teachers engage in reflective inquiry to identify challenges, implement interventions, and measure their impact on student learning.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                Through action research, we continuously enhance our instructional methods and create evidence-based solutions to classroom challenges.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="border-school-blue/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-school-blue">Research Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Instructional strategies and methodologies</li>
                  <li>Student engagement and motivation</li>
                  <li>Assessment and evaluation techniques</li>
                  <li>Classroom management approaches</li>
                  <li>Technology integration in teaching</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-school-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-school-blue">Research Process</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Identify a problem or area for improvement</li>
                  <li>Review relevant literature and best practices</li>
                  <li>Design and implement an intervention</li>
                  <li>Collect and analyze data</li>
                  <li>Reflect on findings and share results</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
