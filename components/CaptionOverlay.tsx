
import React, { useEffect, useState } from 'react';
import { LiveCaption } from '../types';

interface CaptionOverlayProps {
  caption: LiveCaption | null;
  isVisible: boolean;
}

const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ caption, isVisible }) => {
  const [activeCaption, setActiveCaption] = useState<LiveCaption | null>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (caption) {
      setActiveCaption(caption);
      setFade(true);
      
      // Auto-clear caption after 4 seconds of no update
      const timer = setTimeout(() => {
        setFade(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [caption]);

  if (!isVisible || !activeCaption || !fade) return null;

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 max-w-[80%] pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-black/85 backdrop-blur-md px-6 py-3 rounded-sm border border-white/5 shadow-2xl flex flex-col items-center text-center">
        <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">
          {activeCaption.speakerName}
        </span>
        <p className="text-white text-lg md:text-xl font-medium tracking-tight leading-relaxed">
          {activeCaption.text}
        </p>
      </div>
    </div>
  );
};

export default CaptionOverlay;
