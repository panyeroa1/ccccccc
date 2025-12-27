
import React, { useEffect, useState, useRef } from 'react';
import { LiveCaption } from '../types';

interface CaptionOverlayProps {
  caption: LiveCaption | null;
  isVisible: boolean;
}

const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ caption, isVisible }) => {
  const [activeCaption, setActiveCaption] = useState<LiveCaption | null>(null);
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (caption && caption.text.trim().length > 0) {
      setActiveCaption(caption);
      setShow(true);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        setShow(false);
      }, 5000);
    }
  }, [caption]);

  if (!isVisible || !activeCaption || !show) return null;

  return (
    <div className="absolute bottom-24 left-0 right-0 flex justify-center z-[100] pointer-events-none px-10">
      <div 
        className="w-full max-w-5xl h-10 flex items-center px-6 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 font-roboto"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
      >
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap border-r border-white/10 pr-3">
            {activeCaption.speakerName}
          </span>
          <div className="flex-1 overflow-hidden">
            <p className="text-[12px] text-white tracking-tight truncate animate-streaming-text">
              {activeCaption.text}
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes streaming-text {
          0% { transform: translateX(10px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-streaming-text {
          animation: streaming-text 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CaptionOverlay;
