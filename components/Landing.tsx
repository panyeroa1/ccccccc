
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface LandingProps {
  onStart: (userName: string, roomName: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [room, setRoom] = useState('');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (room) {
      onStart('', room.replace('orbit.ai/', ''));
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden font-sans">
      {/* Splash Screen Overlay */}
      <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${showSplash ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="relative mb-12 animate-in zoom-in-50 fade-in duration-1000">
           <Logo className="w-48 h-48" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-light text-white uppercase tracking-[1em] ml-[1em] animate-pulse">Orbit</h2>
          <div className="h-0.5 w-12 bg-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-white animate-orbit-loading" />
          </div>
        </div>
      </div>

      <header className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center z-10">
        <div className="flex items-center gap-4 group cursor-pointer">
          <Logo className="w-10 h-10 transition-transform group-hover:scale-110 duration-500" />
          <span className="text-2xl font-light tracking-widest text-white uppercase">Orbit</span>
        </div>
      </header>

      <div className="w-full h-full flex items-center justify-center relative z-10 px-6">
        <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-7xl md:text-8xl font-thin tracking-tight text-white uppercase leading-[1.1] animate-in fade-in zoom-in-95 duration-700">Connect in the void.</h1>
            <p className="text-lg text-neutral-500 font-light uppercase tracking-[0.4em]">Pure communication • No limits</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
            <div className="relative group">
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-8 py-8 bg-transparent border-b border-white/10 text-white placeholder-neutral-800 focus:border-white outline-none transition-all text-4xl font-light tracking-normal uppercase"
                placeholder="ROOM_NAME"
                required
                autoFocus
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-800 group-focus-within:text-white transition-colors">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>
            <button
              type="submit"
              disabled={!room}
              className="w-full py-6 bg-white hover:bg-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-700 text-black text-xs font-normal uppercase tracking-[0.5em] transition-all active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              Initialize Session
            </button>
          </form>
        </div>
      </div>

      <footer className="absolute bottom-10 w-full px-10 flex justify-between text-[10px] font-light uppercase tracking-[0.4em] text-neutral-600">
        <span>Orbit RTC v2.6.0</span>
        <span>Void-Grade Encryption</span>
      </footer>

      <style>{`
        @keyframes orbit-loading {
          0% { left: -100%; width: 0%; }
          50% { left: 0%; width: 100%; }
          100% { left: 100%; width: 0%; }
        }
        .animate-orbit-loading { animation: orbit-loading 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Landing;
