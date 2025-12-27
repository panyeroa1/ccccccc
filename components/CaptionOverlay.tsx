import React, { useEffect, useState, useRef, useMemo } from 'react';
import { LiveCaption } from '../types';

interface CaptionOverlayProps {
  caption: LiveCaption | null;
  isVisible: boolean;
}

const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ caption, isVisible }) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentSpeaker, setCurrentSpeaker] = useState<string>('');
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

        // Find the next word or character to append
        // We split by spaces to ensure "word-by-word" feel
        const prevWords = prev.split(' ');
        const targetWords = target.split(' ');
        
        if (prevWords.length < targetWords.length) {
          return targetWords.slice(0, prevWords.length + 1).join(' ');
        }
        
        // If words are the same length but text is different (e.g. punctuation change), 
        // just snap to target
        return target;
      });
    }, 80); // Speed of the "stream" reveal

    return () => {
      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
    };
  }, [isVisible]);

  // Clear text after a period of silence
  useEffect(() => {
    const timer = setTimeout(() => {
      if (caption && Date.now() - caption.timestamp > 5000) {
        setDisplayedText('');
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [caption]);

  if (!isVisible || !displayedText) return null;

  return (
    <div className="absolute bottom-28 left-0 right-0 flex flex-col items-center z-[100] pointer-events-none px-10 group">
      {/* The "Void Line" - Horizontal anchor for the text */}
      <div className="w-full max-w-6xl relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        <div className="absolute top-0 left-0 h-[1px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out" 
             style={{ width: `${Math.min(100, (displayedText.length / 100) * 100)}%` }} />
      </div>

      <div className="w-full max-w-6xl mt-4 flex items-start gap-6 bg-black/20 backdrop-blur-sm p-4 border-l border-white/10">
        <div className="flex flex-col gap-1 shrink-0">
          <span className="text-[9px] font-normal text-neutral-500 uppercase tracking-[0.4em] leading-none">
            {currentSpeaker || 'SOURCE'}
          </span>
          <div className="h-0.5 w-4 bg-white/20" />
        </div>

        <div className="flex-1">
          <p className="text-lg md:text-xl text-white font-light tracking-tight leading-relaxed animate-in fade-in slide-in-from-left-4 duration-500">
            {displayedText.split(' ').map((word, i) => (
              <span 
                key={`${i}-${word}`} 
                className="inline-block mr-1.5 animate-in fade-in zoom-in-95 duration-300 fill-mode-both"
                style={{ animationDelay: `${i * 10}ms` }}
              >
                {word}
              </span>
            ))}
            <span className="inline-block w-1.5 h-5 bg-white ml-2 animate-pulse align-middle" />
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes word-reveal {
          from { opacity: 0; transform: translateY(4px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-word {
          animation: word-reveal 0.4s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default CaptionOverlay;