
import React, { useState } from 'react';

export type DisplaySurface = 'monitor' | 'window' | 'browser';

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (withAudio: boolean, surface: DisplaySurface) => void;
}

const ScreenShareModal: React.FC<ScreenShareModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [shareAudio, setShareAudio] = useState(false);
  const [selectedSurface, setSelectedSurface] = useState<DisplaySurface>('monitor');

  if (!isOpen) return null;

  const modes: { id: DisplaySurface; label: string; desc: string; icon: React.ReactNode }[] = [
    { 
      id: 'monitor', 
      label: 'Entire Screen', 
      desc: 'Share your whole desktop and all open applications.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
    { 
      id: 'window', 
      label: 'Specific Window', 
      desc: 'Focus on a single application window for better privacy.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 8h16" /></svg>
    },
    { 
      id: 'browser', 
      label: 'Browser Tab', 
      desc: 'Best for sharing presentations or web applications.',
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
    }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 px-6">
      <div className="max-w-2xl w-full bg-black border border-white/5 rounded-none p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-none bg-white flex items-center justify-center text-black mb-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Broadcast Config</h2>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] max-w-sm">
            Select source for void-grade transmission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setSelectedSurface(mode.id)}
              className={`flex flex-col items-center p-6 border transition-all text-center gap-4 ${selectedSurface === mode.id ? 'bg-white text-black border-white' : 'bg-transparent border-white/5 text-neutral-600 hover:bg-white/5'}`}
            >
              <div className={`p-3 ${selectedSurface === mode.id ? 'bg-black text-white' : 'bg-neutral-900'}`}>
                {mode.icon}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest block">{mode.label}</span>
                <p className={`text-[8px] font-bold leading-relaxed tracking-tight ${selectedSurface === mode.id ? 'text-black/60' : 'text-neutral-700'}`}>{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-6 border-t border-white/5">
          <button 
            onClick={() => setShareAudio(!shareAudio)}
            className={`w-full flex items-center justify-between p-6 border transition-all text-left group ${shareAudio ? 'border-white bg-white/5' : 'border-white/5 hover:border-white/10'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 flex items-center justify-center transition-colors ${shareAudio ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-700'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest ${shareAudio ? 'text-white' : 'text-neutral-700'}`}>System Audio Uplink</span>
              </div>
            </div>
            <div className={`w-5 h-5 border flex items-center justify-center transition-all ${shareAudio ? 'border-white bg-white' : 'border-neutral-800'}`}>
              {shareAudio && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={() => onConfirm(shareAudio, selectedSurface)}
            className="w-full py-6 bg-white hover:bg-neutral-200 text-black font-black uppercase tracking-[0.4em] text-xs transition-all shadow-xl active:scale-[0.98]"
          >
            Launch Stream
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-transparent hover:bg-white/5 text-neutral-700 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
          >
            Abort
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenShareModal;
