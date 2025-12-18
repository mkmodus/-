import React, { useState, useEffect } from 'react';

export const Header: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isFullscreen) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 py-4 px-6 flex items-center justify-between shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3">
        <img 
          src="https://platformc.kr/static/82af0600254ab27db6931a77139eeef8/f1831/logo_website_2023.webp" 
          alt="PlatformC Logo" 
          className="h-8 object-contain"
        />
      </div>
      <div className="text-[10px] sm:text-xs text-orange-600 font-bold whitespace-nowrap ml-4 bg-orange-50 px-2 py-1 rounded">
        Gemini 3 Flash
      </div>
    </header>
  );
};
