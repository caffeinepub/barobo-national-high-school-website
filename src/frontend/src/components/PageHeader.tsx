import { useState, CSSProperties } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  backgroundStyle?: CSSProperties;
  onBackgroundError?: () => void;
  blinkTitle?: boolean;
}

export default function PageHeader({ 
  title, 
  description, 
  backgroundStyle,
  onBackgroundError,
  blinkTitle = false
}: PageHeaderProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    if (onBackgroundError) {
      onBackgroundError();
    }
  };

  const defaultStyle: CSSProperties = {
    backgroundColor: '#800000',
  };

  const finalStyle = backgroundStyle && !imageError ? backgroundStyle : defaultStyle;

  return (
    <div 
      className="relative py-16 text-white"
      style={finalStyle}
      onError={handleImageError}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="container relative mx-auto px-4 text-center">
        <h1 className={`mb-4 text-4xl font-bold md:text-5xl ${blinkTitle ? 'animate-blink' : ''}`}>
          {title}
        </h1>
        {description && (
          <p className="mx-auto max-w-2xl text-lg text-white/90">{description}</p>
        )}
      </div>
    </div>
  );
}
