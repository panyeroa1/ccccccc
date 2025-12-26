
import React, { useState, useEffect } from 'react';
import { Participant, ParticipantRole, ConnectionQuality } from '../types';

interface ParticipantGridProps {
  participants: Participant[];
}

const ParticipantGrid: React.FC<ParticipantGridProps> = ({ participants }) => {
  const [simulatedSpeakingIds, setSimulatedSpeakingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Organic simulation: participants join/leave the "speaking" state at random intervals
    const interval = setInterval(() => {
      setSimulatedSpeakingIds(prev => {
        const next = new Set(prev);
        participants.forEach(p => {
          // Only simulate for remote participants, excluding AI which is handled by its own logic
          if (p.id !== 'local-user' && p.role !== ParticipantRole.AI) {
            const isCurrentlySimulated = next.has(p.id);
            
            if (isCurrentlySimulated) {
              // 40% chance to stop speaking if currently active
              if (Math.random() > 0.6) next.delete(p.id);
            } else {
              // 15% chance to start speaking if silent
              if (Math.random() > 0.85) next.add(p.id);
            }
          }
        });
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [participants]);

  const count = participants.length;
  let gridClass = 'grid-cols-1';
  
  // Responsive Jitsi-like Grid Logic
  if (count === 1) {
    gridClass = 'grid-cols-1';
  } else if (count === 2) {
    gridClass = 'grid-cols-1 md:grid-cols-2';
  } else if (count <= 4) {
    gridClass = 'grid-cols-2';
  } else if (count <= 6) {
    gridClass = 'grid-cols-2 md:grid-cols-3';
  } else if (count <= 9) {
    gridClass = 'grid-cols-3';
  } else {
    gridClass = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5';
  }

  return (
    <div className={`grid ${gridClass} gap-1.5 w-full h-full p-1.5 overflow-hidden bg-black transition-all duration-500`}>
      {participants.map((p) => (
        <ParticipantTile 
          key={p.id} 
          participant={p} 
          isLocal={p.id === 'local-user'} 
          isSimulatedSpeaking={simulatedSpeakingIds.has(p.id)}
          isSolo={count === 1}
        />
      ))}
    </div>
  );
};

const ConnectionIndicator: React.FC<{ quality?: ConnectionQuality }> = ({ quality = 'good' }) => {
  const getStyles = () => {
    switch (quality) {
      case 'poor':
        return { color: 'bg-red-500', bars: 1, pulse: 'animate-pulse' };
      case 'fair':
        return { color: 'bg-yellow-500', bars: 2, pulse: '' };
      default:
        return { color: 'bg-green-500', bars: 3, pulse: '' };
    }
  };

  const { color, bars, pulse } = getStyles();

  return (
    <div className={`flex items-end gap-[1.5px] h-3 px-1.5 py-1 bg-black/40 backdrop-blur-sm rounded-sm border border-white/5 transition-all duration-300 ${pulse}`} title={`Connection: ${quality}`}>
      <div className={`w-[2px] h-[30%] rounded-full transition-colors duration-500 ${bars >= 1 ? color : 'bg-white/10'}`} />
      <div className={`w-[2px] h-[60%] rounded-full transition-colors duration-500 ${bars >= 2 ? color : 'bg-white/10'}`} />
      <div className={`w-[2px] h-[100%] rounded-full transition-colors duration-500 ${bars >= 3 ? color : 'bg-white/10'}`} />
    </div>
  );
};

const ParticipantTile: React.FC<{ 
  participant: Participant; 
  isLocal?: boolean;
  isSimulatedSpeaking?: boolean;
  isSolo?: boolean;
}> = ({ participant, isLocal, isSimulatedSpeaking, isSolo }) => {
  const isCurrentlySpeaking = participant.isSpeaking || isSimulatedSpeaking;
  const isSharing = participant.isSharingScreen;
  const isHandRaised = participant.isHandRaised;

  // Orbit Premium Style: High contrast, Electric Blue accents, layered depth
  const borderStyle = isCurrentlySpeaking 
    ? 'border-2 border-blue-500 z-10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
    : 'border border-white/10 z-0';

  return (
    <div className={`relative bg-[#0d0d0d] rounded-sm overflow-hidden flex items-center justify-center transition-all duration-300 ${borderStyle} ${isSolo ? 'w-full h-full' : ''}`}>
      {/* Media Layer */}
      <div className="absolute inset-0 overflow-hidden">
        {isSharing ? (
          <div className="w-full h-full bg-black flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-blue-500 opacity-30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">Screen Stream</span>
          </div>
        ) : (participant.isVideoOff || participant.role === ParticipantRole.AI) ? (
          <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
             <div className={`${isSolo ? 'w-44 h-44 text-6xl' : 'w-24 h-24 text-3xl'} rounded-full flex items-center justify-center font-light transition-all duration-700 ${participant.role === ParticipantRole.AI ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'bg-neutral-900 text-neutral-600 border border-white/5'}`}>
                {participant.role === ParticipantRole.AI ? (
                  <svg className={`${isSolo ? 'w-20 h-20' : 'w-10 h-10'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                ) : participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
             </div>
          </div>
        ) : (
          <img 
            src={`https://picsum.photos/seed/${participant.id}/1280/720`} 
            alt={participant.name} 
            className={`w-full h-full object-cover transition-all duration-700 ${isCurrentlySpeaking ? 'scale-[1.03] brightness-110' : 'scale-100 brightness-100'}`}
          />
        )}
      </div>

      {/* Advanced Speaking Visuals */}
      {isCurrentlySpeaking && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Energy Pulse Ring */}
          <div className="absolute inset-0 border-[5px] border-blue-500/0 animate-orbit-pulse-ring" />
          {/* Breathing Aura */}
          <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(59,130,246,0.35)] animate-orbit-glow" />
          {/* Inner Sharp Border */}
          <div className="absolute inset-0 border-2 border-blue-400/10" />
        </div>
      )}

      {/* Jitsi-style Raise Hand Overlay */}
      {isHandRaised && (
        <div className="absolute top-4 left-4 bg-yellow-500 p-2 rounded-full shadow-2xl animate-bounce z-20 border-2 border-black/10">
           <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M10.5 4.5a1.5 1.5 0 113 0v4.382l.224.112A3 3 0 0115.382 11.7l-.427 1.282a5 5 0 01-4.743 3.418H7a1 1 0 01-1-1v-2.122a1 1 0 01.3-.707L8.586 10.3l.164-.164a2.5 2.5 0 00.75-1.768V4.5z" /></svg>
        </div>
      )}

      {/* Name Label with Micro-Waveform */}
      <div className={`absolute bottom-3 left-3 flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded-[2px] backdrop-blur-md z-20 border border-white/10 transition-all duration-300 ${isCurrentlySpeaking ? 'translate-x-1' : ''}`}>
        <span className="text-white text-[11px] font-bold tracking-tight">{participant.name || 'Unknown'} {isLocal && '(You)'}</span>
        
        {participant.isMuted ? (
          <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        ) : isCurrentlySpeaking && (
           <div className="flex items-end gap-[1.5px] h-3 ml-1">
             <div className="w-[1.5px] bg-blue-400 rounded-full animate-orbit-wave-1" />
             <div className="w-[1.5px] bg-blue-400 rounded-full animate-orbit-wave-2" />
             <div className="w-[1.5px] bg-blue-400 rounded-full animate-orbit-wave-3" />
           </div>
        )}
      </div>
      
      {/* Enhanced Connection Indicator (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20">
        <ConnectionIndicator quality={participant.connection} />
      </div>

      <style>{`
        @keyframes orbit-pulse-ring {
          0% { transform: scale(0.98); border-color: rgba(59, 130, 246, 0.6); border-width: 5px; }
          100% { transform: scale(1.06); border-color: rgba(59, 130, 246, 0); border-width: 1px; }
        }
        @keyframes orbit-glow {
          0%, 100% { box-shadow: inset 0 0 35px rgba(59, 130, 246, 0.25); }
          50% { box-shadow: inset 0 0 70px rgba(59, 130, 246, 0.45); }
        }
        @keyframes orbit-wave {
          0%, 100% { height: 25%; opacity: 0.6; }
          50% { height: 100%; opacity: 1; }
        }
        .animate-orbit-pulse-ring {
          animation: orbit-pulse-ring 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .animate-orbit-glow {
          animation: orbit-glow 2.8s ease-in-out infinite;
        }
        .animate-orbit-wave-1 { animation: orbit-wave 0.45s ease-in-out infinite; }
        .animate-orbit-wave-2 { animation: orbit-wave 0.65s ease-in-out infinite 0.1s; }
        .animate-orbit-wave-3 { animation: orbit-wave 0.55s ease-in-out infinite 0.2s; }
      `}</style>
    </div>
  );
};

export default ParticipantGrid;
