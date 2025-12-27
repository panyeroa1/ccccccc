
import React, { useEffect, useState, useRef } from 'react';
import { LiveCaption } from '../types';

interface CaptionOverlayProps {
  caption: LiveCaption | null;
  isVisible: boolean;
}

const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ caption, isVisible }) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentSpeaker, setCurrentSpeaker] = useState<string>('');
  const streamingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullTextRef = useRef<string>('');

  // Update the target text when a new caption arrives
  useEffect(() => {
    if (caption) {
      fullTextRef.current = caption.text;
      setCurrentSpeaker(caption.speakerName);
    }
  }, [caption]);

  // Handle the "streaming" catch-up logic
  useEffect(() => {
    if (!isVisible) {
      setDisplayedText('');
      return;
    }

    if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);

    streamingIntervalRef.current = setInterval(() => {
      setDisplayedText(prev => {
        const target = fullTextRef.current;
        if (prev === target) return prev;

        const prevWords = prev.split(' ');
        const targetWords = target.split(' ');
        
        if (prevWords.length < targetWords.length) {
          return targetWords.slice(0, prevWords.length + 1).join(' ');
        }
        
        return target;
      });
    }, 60);

    return () => {
      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
    };
  }, [isVisible]);

  // Clear text after a period of silence
  useEffect(() => {
    const timer = setTimeout(() => {
      if (caption && Date.now() - caption.timestamp > 8000) {
        setDisplayedText('');
        fullTextRef.current = '';
      }
    }, 9000);
    return () => clearTimeout(timer);
  }, [caption]);

  if (!isVisible || !displayedText) return null;

  return (
    <div className="absolute bottom-28 left-0 right-0 flex flex-col items-center z-[100] pointer-events-none px-10">
      <div className="w-full max-w-4xl relative flex flex-col items-center gap-4">
        {/* Progress Line */}
        <div className="w-full h-[1px] bg-white/5 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, (displayedText.length / (fullTextRef.current.length || 1)) * 100)}%` }}
          />
        </div>

        {/* Text Container */}
        <div className="bg-black/40 backdrop-blur-md border border-white/5 px-8 py-4 text-center max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="flex flex-col gap-2">
              <span className="text-[9px] font-light text-neutral-500 uppercase tracking-[0.4em] mb-1">
                {currentSpeaker}
              </span>
              <p className="text-lg md:text-xl font-light text-white leading-relaxed tracking-tight">
                {displayedText}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionOverlay;
