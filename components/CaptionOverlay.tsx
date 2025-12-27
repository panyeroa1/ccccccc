
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
      <div className="bg-black/90 backdrop-blur-3xl px-8 py-4 rounded-none border border-white/10 shadow-2xl flex flex-col items-center text-center">
        <span className="text-neutral-400 text-[9px] font-black uppercase tracking-[0.4em] mb-2">
          {activeCaption.speakerName}
        </span>
        <p className="text-white text-xl md:text-2xl font-black tracking-tighter leading-tight uppercase">
          {activeCaption.text}
        </p>
      </div>
    </div>
  );
};

export default CaptionOverlay;
