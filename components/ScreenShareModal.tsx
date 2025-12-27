
import React, { useState } from 'react';

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (withAudio: boolean) => void;
}

const ScreenShareModal: React.FC<ScreenShareModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [shareAudio, setShareAudio] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 px-6">
      <div className="max-w-xl w-full bg-[#0d0d0d] border border-white/5 rounded-sm p-10 shadow-2xl space-y-10 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 mb-2 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.15)]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tighter">Share your screen</h2>
          <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-sm">
            Present your entire screen, a specific window, or a browser tab to the other participants.
          </p>
        </div>

        <div className="space-y-4 pt-6">
          <button 
            onClick={() => setShareAudio(!shareAudio)}
            className={`w-full flex items-center justify-between p-6 bg-white/5 border rounded-sm transition-all text-left group ${shareAudio ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/10'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${shareAudio ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold tracking-tight ${shareAudio ? 'text-blue-500' : 'text-white'}`}>Include System Audio</span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Best for sharing videos or music</span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${shareAudio ? 'border-blue-500 bg-blue-500' : 'border-neutral-700'}`}>
              {shareAudio && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={() => onConfirm(shareAudio)}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-sm transition-all shadow-xl shadow-blue-600/10 active:scale-[0.98]"
          >
            Select Source
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-transparent hover:bg-white/5 text-neutral-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
        </div>
        
        <p className="text-center text-[9px] text-neutral-600 font-bold uppercase tracking-[0.2em]">
          End-to-end encrypted • Orbit Secure Share
        </p>
      </div>
    </div>
  );
};

export default ScreenShareModal;
