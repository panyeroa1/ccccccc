
import React, { useState } from 'react';

interface LandingProps {
  onStart: (userName: string, roomName: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [room, setRoom] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (room) {
      // Pass empty string for name; it will be collected in the Lobby
      onStart('', room.replace('orbit.ai/', ''));
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden px-6 font-sans">
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-sm bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">Orbit</span>
        </div>
      </header>

      <div className="max-w-xl w-full text-center space-y-8 relative z-10">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white">Start a meeting.</h1>
          <p className="text-lg text-neutral-500 font-medium">Free, high-quality video calls. No account required.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          <div className="relative group">
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-5 py-4 bg-[#111] border border-white/10 rounded-lg text-white placeholder-neutral-700 focus:border-blue-500 outline-none transition-all text-sm font-medium pr-12"
              placeholder="Enter room name"
              required
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </div>
          </div>
          <button
            type="submit"
            disabled={!room}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-bold rounded-lg transition-all shadow-xl shadow-blue-600/10 active:scale-[0.98]"
          >
            Go
          </button>
        </form>

        <div className="flex justify-center gap-12 pt-12 opacity-40">
           <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                 <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Encrypted</span>
           </div>
           <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                 <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">No Installs</span>
           </div>
        </div>
      </div>

      <footer className="absolute bottom-8 text-[10px] font-bold uppercase tracking-widest text-neutral-700">
        Orbit RTC v2.5.0 • Powered by WebRTC
      </footer>
    </div>
  );
};

export default Landing;
