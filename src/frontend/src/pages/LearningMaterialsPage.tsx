import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function LearningMaterialsPage() {
  const resources = [
    { title: 'SDS Division Portal', url: 'https://depedsurigaodelsur.com', description: 'Access division-level resources and announcements' },
    { title: 'DepEd LRMDS Portal', url: 'https://lrmds.deped.gov.ph', description: 'Learning Resource Management and Development System' },
    { title: 'DepEd Website', url: 'https://www.deped.gov.ph', description: 'Official Department of Education website' },
    { title: 'DepEd TV', url: 'https://www.youtube.com/@DepEdTV', description: 'Educational television programs and videos' },
  ];

  return (
    <div>
      <PageHeader
        title="Learning Materials and Resources"
        description="Access educational resources and materials"
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2">
            {resources.map((resource) => (
              <Card key={resource.title} className="border-school-gold/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-school-blue">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">{resource.description}</p>
                  <Button asChild className="bg-school-blue hover:bg-school-blue-dark">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      Visit Site <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
