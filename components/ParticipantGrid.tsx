
import React, { useState, useEffect } from 'react';
import { Participant, ParticipantRole, ConnectionQuality } from '../types';

interface ParticipantGridProps {
  participants: Participant[];
}

const ParticipantGrid: React.FC<ParticipantGridProps> = ({ participants }) => {
  const [simulatedStates, setSimulatedStates] = useState<Record<string, { isSpeaking: boolean, connection: ConnectionQuality }>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedStates(prev => {
        const next = { ...prev };
        participants.forEach(p => {
          if (p.id !== 'local-user' && p.role !== ParticipantRole.AI) {
            const current = next[p.id] || { isSpeaking: false, connection: 'good' };
            let isSpeaking = current.isSpeaking;
            if (isSpeaking) {
              if (Math.random() > 0.6) isSpeaking = false;
            } else {
              if (Math.random() > 0.85) isSpeaking = true;
            }
            let connection: ConnectionQuality = current.connection;
            const rand = Math.random();
            if (rand > 0.95) connection = 'poor';
            else if (rand > 0.85) connection = 'fair';
            else connection = 'good';
            next[p.id] = { isSpeaking, connection };
          }
        });
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [participants]);

  const count = participants.length;
  
  // Dynamic Grid Logic for Jitsi-like scaling
  const getGridConfig = () => {
    if (count === 1) return 'grid-cols-1 max-w-4xl';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-6xl';
    if (count <= 4) return 'grid-cols-2 max-w-5xl';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3 max-w-7xl';
    if (count <= 9) return 'grid-cols-2 md:grid-cols-3 max-w-full';
    if (count <= 12) return 'grid-cols-3 md:grid-cols-4 max-w-full';
    return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 max-w-full';
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-black overflow-hidden">
      <div className={`grid ${getGridConfig()} gap-3 w-full transition-all duration-700 ease-in-out`}>
        {participants.map((p) => (
          <ParticipantTile 
            key={p.id} 
            participant={p} 
            isLocal={p.id === 'local-user'} 
            simulatedState={simulatedStates[p.id]}
            isSolo={count === 1}
          />
        ))}
      </div>
    </div>
  );
};

const ConnectionIndicator: React.FC<{ quality?: ConnectionQuality }> = ({ quality = 'good' }) => {
  const getStyles = () => {
    switch (quality) {
      case 'poor':
        return { color: 'bg-red-500', bars: 1, pulse: 'animate-pulse', label: 'Poor' };
      case 'fair':
        return { color: 'bg-yellow-500', bars: 2, pulse: '', label: 'Fair' };
      default:
        return { color: 'bg-green-500', bars: 4, pulse: '', label: 'Good' };
    }
  };

  const { color, bars, pulse, label } = getStyles();

  return (
    <div className={`group flex items-center gap-1 px-1.5 py-1 bg-black/60 backdrop-blur-md rounded-sm border border-white/5 transition-all ${pulse}`}>
      <div className="flex items-end gap-[1px] h-2.5 w-4">
        {[0.25, 0.5, 0.75, 1.0].map((h, i) => (
          <div 
            key={i}
            style={{ height: `${h * 100}%` }}
            className={`flex-1 rounded-none transition-all duration-500 ${i < bars ? color : 'bg-white/10'}`} 
          />
        ))}
      </div>
    </div>
  );
};

const ParticipantTile: React.FC<{ 
  participant: Participant; 
  isLocal?: boolean;
  simulatedState?: { isSpeaking: boolean, connection: ConnectionQuality };
  isSolo?: boolean;
}> = ({ participant, isLocal, simulatedState, isSolo }) => {
  const isCurrentlySpeaking = participant.isSpeaking || simulatedState?.isSpeaking;
  const connectionQuality = isLocal ? (participant.connection || 'good') : (simulatedState?.connection || participant.connection || 'good');
  const isSharing = participant.isSharingScreen;
  const isHandRaised = participant.isHandRaised;

  const borderStyle = isCurrentlySpeaking 
    ? 'border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
    : isSharing 
      ? 'border border-blue-600/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
      : 'border border-white/5';

  return (
    <div className={`relative bg-[#0d0d0d] rounded-lg overflow-hidden flex items-center justify-center transition-all duration-500 aspect-square mx-auto w-full ${borderStyle}`}>
      {/* Media Layer */}
      <div className="absolute inset-0 overflow-hidden">
        {isSharing ? (
          <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
            <svg className="w-10 h-10 text-blue-500 opacity-40 mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">Display Stream</span>
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          </div>
        ) : (participant.isVideoOff || participant.role === ParticipantRole.AI) ? (
          <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
             <div className={`${isSolo ? 'w-40 h-40 text-6xl' : 'w-20 h-20 text-3xl'} rounded-full flex items-center justify-center font-light transition-all duration-700 ${participant.role === ParticipantRole.AI ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.1)]' : 'bg-[#111] text-neutral-600 border border-white/5'}`}>
                {participant.role === ParticipantRole.AI ? (
                  <svg className={`${isSolo ? 'w-16 h-16' : 'w-8 h-8'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                ) : participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
             </div>
          </div>
        ) : (
          <img 
            src={`https://picsum.photos/seed/${participant.id}/800/800`} 
            alt={participant.name} 
            className={`w-full h-full object-cover transition-all duration-700 ${isCurrentlySpeaking ? 'scale-[1.05] brightness-110' : 'scale-100 brightness-100'}`}
          />
        )}
      </div>

      {/* Speaking Glow */}
      {isCurrentlySpeaking && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 border-[3px] border-blue-500/0 animate-orbit-pulse-ring" />
          <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(59,130,246,0.3)] animate-orbit-glow" />
        </div>
      )}

      {/* Presenting Badge */}
      {isSharing && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-blue-600 px-2 py-1 rounded-sm shadow-xl border border-white/10">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">Live</span>
        </div>
      )}

      {/* Hand Raised Badge */}
      {isHandRaised && (
        <div className="absolute top-3 left-3 bg-yellow-500 p-1.5 rounded-sm shadow-2xl animate-bounce z-20 border border-black/5">
           <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M10.5 4.5a1.5 1.5 0 113 0v4.382l.224.112A3 3 0 0115.382 11.7l-.427 1.282a5 5 0 01-4.743 3.418H7a1 1 0 01-1-1v-2.122a1 1 0 01.3-.707L8.586 10.3l.164-.164a2.5 2.5 0 00.75-1.768V4.5z" /></svg>
        </div>
      )}

      {/* Information Overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20">
        <div className={`flex items-center gap-2 bg-black/70 px-2 py-1 rounded-sm backdrop-blur-md border border-white/5 transition-all duration-300 ${isCurrentlySpeaking ? 'translate-x-0.5' : ''}`}>
          <span className="text-white text-[10px] font-bold tracking-tight whitespace-nowrap">{participant.name || 'User'}</span>
          {participant.isMuted && (
            <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          )}
          {!participant.isMuted && isCurrentlySpeaking && (
             <div className="flex items-end gap-[1px] h-2.5">
               <div className="w-[1.5px] bg-blue-400 rounded-none animate-orbit-wave-1" />
               <div className="w-[1.5px] bg-blue-400 rounded-none animate-orbit-wave-2" />
               <div className="w-[1.5px] bg-blue-400 rounded-none animate-orbit-wave-3" />
             </div>
          )}
        </div>
        <ConnectionIndicator quality={connectionQuality} />
      </div>

      <style>{`
        @keyframes orbit-pulse-ring {
          0% { transform: scale(0.98); border-color: rgba(59, 130, 246, 0.4); border-width: 3px; }
          100% { transform: scale(1.04); border-color: rgba(59, 130, 246, 0); border-width: 1px; }
        }
        @keyframes orbit-glow {
          0%, 100% { box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: inset 0 0 40px rgba(59, 130, 246, 0.35); }
        }
        @keyframes orbit-wave {
          0%, 100% { height: 30%; opacity: 0.6; }
          50% { height: 100%; opacity: 1; }
        }
        .animate-orbit-pulse-ring { animation: orbit-pulse-ring 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .animate-orbit-glow { animation: orbit-glow 2.8s ease-in-out infinite; }
        .animate-orbit-wave-1 { animation: orbit-wave 0.45s ease-in-out infinite; }
        .animate-orbit-wave-2 { animation: orbit-wave 0.65s ease-in-out infinite 0.1s; }
        .animate-orbit-wave-3 { animation: orbit-wave 0.55s ease-in-out infinite 0.2s; }
      `}</style>
    </div>
  );
};

export default ParticipantGrid;
