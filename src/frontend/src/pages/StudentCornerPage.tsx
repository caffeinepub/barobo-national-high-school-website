import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentCornerPage() {
  return (
    <div>
      <PageHeader
        title="Student Corner"
        description="Resources and information for students"
      />
      {/* Maroon Background Box Section */}
      <section className="py-16 bg-[#800000]">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-school-gold/20 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-school-blue">Students' Outputs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Showcase of student work, projects, and creative outputs from various programs and activities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-school-gold/20 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-school-blue">Freedom Wall</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  A space for students to express their thoughts, ideas, and messages to the school community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
