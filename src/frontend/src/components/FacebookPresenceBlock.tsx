import { useState, useEffect, useRef } from 'react';
import { SiFacebook } from 'react-icons/si';
import { buildFacebookPagePluginUrl } from '../lib/facebookPagePlugin';

interface FacebookPresenceBlockProps {
  maxHeight?: number;
}

export default function FacebookPresenceBlock({ maxHeight }: FacebookPresenceBlockProps) {
  const [embedState, setEmbedState] = useState<'loading' | 'success' | 'failed'>('loading');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const facebookPageUrl = 'https://www.facebook.com/BaroboNationalHighSchool';

  // Calculate the embed container height based on maxHeight
  // Subtract header height (approx 60px for title + padding) to get embed area height
  const embedHeight = maxHeight ? maxHeight - 60 : 500;

  useEffect(() => {
    // Set a timeout to detect if the embed fails to load (10 seconds)
    timeoutRef.current = setTimeout(() => {
      if (embedState === 'loading') {
        setEmbedState('failed');
      }
    }, 10000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [embedState]);

  const handleIframeLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setEmbedState('success');
  };

  const handleIframeError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setEmbedState('failed');
  };

  // Build the Facebook Page Plugin iframe URL
  const iframeUrl = buildFacebookPagePluginUrl({
    pageUrl: facebookPageUrl,
    tabs: 'timeline',
    width: 500,
    height: embedHeight,
    smallHeader: false,
    adaptContainerWidth: true,
    hideCover: false,
    showFacepile: true,
  });

  return (
    <div 
      className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-md"
      style={maxHeight ? { height: `${maxHeight}px` } : undefined}
    >
      <h3 className="mb-4 text-center text-xl font-bold text-[#800000]">
        Connect with Us on Facebook
      </h3>
      
      <div 
        className="flex items-center justify-center overflow-hidden rounded-lg bg-white"
        style={maxHeight ? { height: `${embedHeight}px` } : undefined}
      >
        {embedState === 'failed' ? (
          // Fallback: Show Facebook icon and link when embed fails
          <a
            href={facebookPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-8 text-center transition-transform hover:scale-105"
            aria-label="Visit our Facebook page"
          >
            <SiFacebook className="h-20 w-20 text-[#1877F2]" />
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Visit Our Facebook Page
              </p>
              <p className="text-sm text-gray-600">
                Barobo National High School
              </p>
            </div>
          </a>
        ) : (
          // Facebook Page Plugin iframe embed
          <div className="relative h-full w-full">
            {embedState === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#1877F2] mx-auto"></div>
                  <p className="text-sm text-gray-600">Loading Facebook feed...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              width="100%"
              height={embedHeight}
              style={{
                border: 'none',
                overflow: 'hidden',
                display: embedState === 'loading' ? 'none' : 'block',
              }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Facebook Page Plugin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
