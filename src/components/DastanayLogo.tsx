import React, { useState, useEffect } from 'react';

interface DastanayLogoProps {
  className?: string;
  variant?: 'auto' | 'black' | 'white';
  height?: number | string;
  width?: number | string;
  alt?: string;
  onClick?: () => void;
}

export const DastanayLogo: React.FC<DastanayLogoProps> = ({
  className = '',
  variant = 'auto',
  height = 28,
  width,
  alt = 'DASTANAY',
  onClick,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Observe changes to the 'dark' class on html element
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also listen to system color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      // If no explicit theme class is forced or system theme applies
      if (document.documentElement.classList.contains('dark')) {
        setIsDark(true);
      } else {
        setIsDark(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // Determine which official logo asset to render
  const useWhite = variant === 'white' || (variant === 'auto' && isDark);

  const localSrc = useWhite
    ? '/assets/dastanay-logo-white.png'
    : '/assets/dastanay-logo-black.png';

  const fallbackSrc = useWhite
    ? 'https://i.ibb.co/1Gk2ZfR2/Dastanay.png'
    : 'https://i.ibb.co/BHb9v4wH/Dastanay-1.png';

  const [currentSrc, setCurrentSrc] = useState<string>(localSrc);

  useEffect(() => {
    setCurrentSrc(localSrc);
  }, [localSrc]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
        maxWidth: '100%',
      }}
      className={`object-contain select-none transition-opacity duration-150 ${className}`}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
      onClick={onClick}
    />
  );
};
