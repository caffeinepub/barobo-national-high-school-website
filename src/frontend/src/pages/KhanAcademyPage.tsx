import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function KhanAcademyPage() {
  return (
    <div>
      <PageHeader title="Khan Academy" description="Free online learning resources" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Khan Academy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 leading-relaxed">
                Khan Academy offers free, world-class education for anyone, anywhere. Access thousands of lessons in math, science, and more.
              </p>
              <Button asChild className="bg-school-blue hover:bg-school-blue-dark">
                <a href="https://www.khanacademy.org" target="_blank" rel="noopener noreferrer">
                  Visit Khan Academy <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
