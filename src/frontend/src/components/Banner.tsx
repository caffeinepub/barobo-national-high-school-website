import { useGetCurrentBanner, useGetBannerVersion } from '@/hooks/useQueries';
import { useMemo } from 'react';
import { getProxiedImageUrl } from '@/lib/imageProxy';

export default function Banner() {
  const { data: banner, isLoading, isError } = useGetCurrentBanner();
  const { data: bannerVersion } = useGetBannerVersion();

  // Default banner image path
  const defaultBannerUrl = '/assets/generated/welcome-banner.dim_1200x400.jpg';

  // Memoize banner URL and metadata to prevent unnecessary recalculations
  const bannerData = useMemo(() => {
    let url = defaultBannerUrl;
    let isAnimatedGif = false;
    let title = 'Barobo National High School';
    let hasError = false;

    if (banner && !isError) {
      title = banner.title || title;
      
      try {
        if (banner.image.__kind__ === 'file' && banner.image.file) {
          url = banner.image.file.file.getDirectURL();
          isAnimatedGif = banner.image.file.isAnimated;
        } else if (banner.image.__kind__ === 'url' && banner.image.url) {
          // Use proxied URL for cloud storage providers
          url = getProxiedImageUrl(banner.image.url);
          // Check if URL ends with .gif to detect animated GIFs from URLs
          isAnimatedGif = banner.image.url.toLowerCase().includes('.gif');
        }
      } catch (err) {
        console.error('Error getting banner URL:', err);
        hasError = true;
        url = defaultBannerUrl;
        isAnimatedGif = false;
      }
    }

    // Add cache-busting parameter using banner version and timestamp
    const cacheBuster = banner && !hasError
      ? `${banner.timestamp.toString()}-${bannerVersion?.toString() || '0'}`
      : `default-${Date.now()}`;
    
    const finalUrl = `${url}${url.includes('?') ? '&' : '?'}v=${cacheBuster}`;

    return {
      url: finalUrl,
      isAnimatedGif,
      title,
      bannerId: banner?.id.toString() || 'default',
    };
  }, [banner, bannerVersion, isError, defaultBannerUrl]);

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-r from-school-blue/10 via-white to-school-gold/10">
        <div className="container mx-auto px-4">
          <div className="relative w-full mx-auto overflow-hidden">
            <div className="w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 animate-pulse bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-school-blue/10 via-white to-school-gold/10">
      <div className="container mx-auto px-4 py-2">
        <div className="relative w-full mx-auto overflow-hidden rounded-lg">
          {/* Responsive container with fixed aspect ratio using object-fit: cover */}
          <div className="relative w-full" style={{ paddingBottom: '31.25%' }}>
            <img
              src={bannerData.url}
              alt={bannerData.title}
              className="absolute inset-0 w-full h-full object-cover"
              key={`banner-${bannerData.bannerId}-${bannerVersion?.toString() || '0'}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== defaultBannerUrl) {
                  console.error('Banner image failed to load, falling back to default');
                  target.src = defaultBannerUrl;
                }
              }}
              loading="eager"
            />
            {bannerData.isAnimatedGif && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                GIF
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

