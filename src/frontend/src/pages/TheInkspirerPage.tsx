import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetAnnouncements } from '@/hooks/useQueries';

export default function TheInkspirerPage() {
  const { data: announcements = [], isLoading } = useGetAnnouncements();

  return (
    <div>
      <PageHeader
        title="The Inkspirer"
        description="Latest news, updates, and announcements"
        backgroundStyle={{
          backgroundImage: 'url(/assets/generated/news-header.dim_600x200.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <Card className="border-school-gold/20 shadow-lg">
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">No announcements available at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className={`border-school-gold/20 shadow-lg ${announcement.important ? 'border-l-4 border-l-school-gold' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl text-school-blue">{announcement.title}</CardTitle>
                        <CardDescription className="mt-2">
                          Published on {new Date(announcement.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </CardDescription>
                      </div>
                      {announcement.important && (
                        <Badge className="bg-school-gold text-white">Important</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
