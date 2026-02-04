import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Card, CardContent } from './ui/card';
import { Loader2, ImageIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import type { CarouselApi } from '@/components/ui/carousel';

export default function SchoolActivitiesSlider() {
  const { actor, isFetching: actorFetching } = useActor();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const { data: sliderImages, isLoading, error } = useQuery({
    queryKey: ['sliderImages'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllSliderImages();
    },
    enabled: !!actor && !actorFetching,
  });

  // Continuous autoplay with infinite loop
  useEffect(() => {
    if (!carouselApi || !sliderImages || sliderImages.length <= 1) {
      return;
    }

    // Start autoplay
    const startAutoplay = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (carouselApi.canScrollNext()) {
          carouselApi.scrollNext();
        } else {
          // Loop back to the first slide
          carouselApi.scrollTo(0);
        }
      }, 3000);
    };

    startAutoplay();

    // Restart autoplay after user interaction
    const handleSelect = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      startAutoplay();
    };

    carouselApi.on('select', handleSelect);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      carouselApi.off('select', handleSelect);
    };
  }, [carouselApi, sliderImages]);

  if (isLoading || actorFetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">Error loading slider images</p>
      </div>
    );
  }

  if (!sliderImages || sliderImages.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-4">No school activities photos available yet.</p>
        <p className="text-sm text-gray-500 mb-4">
          Admin users can add photos through the School Activities Manager.
        </p>
        <Link
          to="/admin/school-activities-manager"
          className="inline-block px-6 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors"
        >
          Go to School Activities Manager
        </Link>
      </div>
    );
  }

  const sortedImages = [...sliderImages].sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <Carousel
        className="w-full"
        setApi={setCarouselApi}
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent>
          {sortedImages.map((image) => {
            const imageUrl =
              image.image.__kind__ === 'url'
                ? image.image.url
                : image.image.file.file.getDirectURL();

            const cacheBustUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;

            return (
              <CarouselItem key={Number(image.id)}>
                <div className="p-1">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="flex aspect-[1248/600] items-center justify-center p-0 relative overflow-hidden">
                      <img
                        src={cacheBustUrl}
                        alt={image.title || 'School Activity'}
                        className="w-full h-full object-cover transition-opacity duration-500"
                        loading="lazy"
                      />
                      {image.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                          <h3 className="text-white text-xl font-bold mb-1">{image.title}</h3>
                          {image.description && (
                            <p className="text-white/90 text-sm">{image.description}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
}
