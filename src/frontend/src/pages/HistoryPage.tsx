import { useGetHistoryContent } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

export default function HistoryPage() {
  const { data: historyContent, isLoading, error } = useGetHistoryContent();

  const hasBackgroundImage = historyContent?.backgroundImage !== undefined && historyContent?.backgroundImage !== null;
  const backgroundImageUrl = hasBackgroundImage && historyContent?.backgroundImage
    ? `${historyContent.backgroundImage.getDirectURL()}?t=${historyContent.lastUpdated}`
    : '';

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      {hasBackgroundImage && backgroundImageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-white/80" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gray-50" />
      )}

      {/* Content */}
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-school-blue to-school-blue-dark py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold md:text-5xl text-[#800000]">History</h1>
            <p className="mt-2 text-lg text-[#800000]">Learn about the rich heritage of Barobo National High School</p>
          </div>
        </div>

        {/* Maroon Background Box Section */}
        <section className="py-16 bg-[#800000]">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <Card className="border-school-gold/20 shadow-lg bg-white">
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ) : error ? (
              <Alert variant="destructive" className="bg-white">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error instanceof Error && error.message.includes('No content found')
                    ? 'History content has not been added yet. Please check back later.'
                    : 'Failed to load history content. Please try again later.'}
                </AlertDescription>
              </Alert>
            ) : historyContent ? (
              <Card className="border-school-gold/20 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-3xl text-school-blue">{historyContent.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="heritage-content-display ql-editor text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: historyContent.formattedText.content }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Alert className="bg-white">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No history content available. Please check back later.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
