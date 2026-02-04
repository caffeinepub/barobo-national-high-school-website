import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useGetOrganizationalStructure } from '@/hooks/useQueries';

export default function OrganizationalStructurePage() {
  const { data: orgStructure } = useGetOrganizationalStructure();
  const [titleBgError, setTitleBgError] = useState(false);
  const [staticImageError, setStaticImageError] = useState(false);

  const titleBackgroundUrl = orgStructure?.titleBackground?.getDirectURL();
  const titleBackgroundStyle = titleBackgroundUrl && !titleBgError
    ? {
        backgroundImage: `url(${titleBackgroundUrl}?t=${Date.now()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : { backgroundColor: '#800000' };

  const staticImageUrl = orgStructure?.staticImage?.getDirectURL();

  return (
    <div>
      <PageHeader
        title="Organizational Structure"
        description="Meet our leadership team and organizational hierarchy"
        backgroundStyle={titleBackgroundStyle}
        onBackgroundError={() => setTitleBgError(true)}
      />
      
      {/* Maroon Background Box Section */}
      <section className="py-16 bg-[#800000]">
        <div className="container mx-auto px-4">
          {staticImageUrl && !staticImageError ? (
            <div className="w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={`${staticImageUrl}?t=${Date.now()}`}
                alt="Organizational Structure"
                className="w-full h-auto object-contain"
                style={{ maxHeight: '800px' }}
                onError={() => setStaticImageError(true)}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <p className="text-center text-muted-foreground">
                No organizational structure image available. Please contact the administrator to upload an image.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
