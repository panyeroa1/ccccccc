
import React, { useState, useEffect, useMemo } from 'react';
import { Participant, ParticipantRole, ConnectionQuality } from '../types';

interface ParticipantGridProps {
  participants: Participant[];
  localParticipantId: string;
}

const ParticipantGrid: React.FC<ParticipantGridProps> = ({ participants, localParticipantId }) => {
  const [simulatedStates, setSimulatedStates] = useState<Record<string, { isSpeaking: boolean, connection: ConnectionQuality }>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedStates(prev => {
        const next = { ...prev };
        participants.forEach(p => {
          // Only simulate for remote participants who are not AI
          if (p.id !== localParticipantId && p.role !== ParticipantRole.AI) {
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
  }, [participants, localParticipantId]);

  // Priority Logic: Screen sharing participant takes the stage
  const sharer = useMemo(() => participants.find(p => p.isSharingScreen), [participants]);
  const others = useMemo(() => participants.filter(p => p.id !== sharer?.id), [participants, sharer]);

  const count = participants.length;
  
  const getGridConfig = () => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
  };

  return (
    <div className="w-full h-full relative bg-black pt-16 overflow-hidden">
      {/* Zoom-style Global Sharing Indicator */}
      {sharer && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[45] flex items-center animate-in slide-in-from-top-10 duration-700 pointer-events-none">
          <div className="flex items-center gap-4 bg-black/90 backdrop-blur-3xl px-6 py-2.5 border border-white/10 shadow-2xl">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="text-[10px] font-light text-white uppercase tracking-[0.4em]">
              Viewing {sharer.name}'s screen
            </span>
            <div className="w-px h-3 bg-white/20 mx-2" />
            <span className="text-[9px] font-normal text-neutral-500 uppercase tracking-widest">
              Live Broadcast
            </span>
          </div>
        </div>
      )}

      {sharer ? (
        <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 h-full relative p-2 md:p-4">
            <ParticipantTile 
              participant={sharer} 
              isLocal={sharer.id === localParticipantId} 
              simulatedState={simulatedStates[sharer.id]}
              isStage={true}
            />
          </div>
          <div className="w-full md:w-72 h-40 md:h-full bg-black/50 border-l border-white/5 overflow-x-auto md:overflow-y-auto flex md:flex-col p-2 gap-2">
            {others.map((p) => (
              <div key={p.id} className="min-w-[160px] md:min-w-0 aspect-video md:aspect-square flex-shrink-0">
                <ParticipantTile 
                  participant={p} 
                  isLocal={p.id === localParticipantId} 
                  simulatedState={simulatedStates[p.id]}
                  isMini={true}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`grid ${getGridConfig()} w-full h-full transition-all duration-700 ease-in-out`}>
          {participants.map((p) => (
            <ParticipantTile 
              key={p.id} 
              participant={p} 
              isLocal={p.id === localParticipantId} 
              simulatedState={simulatedStates[p.id]}
              isSolo={count === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ConnectionIndicator: React.FC<{ quality?: ConnectionQuality }> = ({ quality = 'good' }) => {
  const bars = quality === 'poor' ? 1 : quality === 'fair' ? 2 : 4;
  const color = quality === 'poor' ? 'text-red-500' : quality === 'fair' ? 'text-yellow-500' : 'text-green-500';
  const bgColor = quality === 'poor' ? 'bg-red-500' : quality === 'fair' ? 'bg-yellow-500' : 'bg-green-500';
  const shadowColor = quality === 'poor' ? 'shadow-[0_0_8px_rgba(239,68,68,0.4)]' : quality === 'fair' ? 'shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'shadow-[0_0_8px_rgba(34,197,94,0.4)]';
  const statusLabel = quality === 'poor' ? 'UNSTABLE' : quality === 'fair' ? 'DEGRADED' : 'STABLE';

  return (
    <div className="group relative flex items-center gap-2">
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-2.5 py-1 border border-white/5 rounded-none">
        <div className={`w-1.5 h-1.5 rounded-full ${bgColor} ${shadowColor} ${quality !== 'good' ? 'animate-pulse' : ''}`} />
        <div className="flex items-end gap-[1.5px] h-3">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`w-[2px] rounded-[0.5px] transition-all duration-500 ${i < bars ? bgColor : 'bg-white/10'}`}
              style={{ height: `${(i + 1) * 25}%` }}
            />
          ))}
        </div>
        <span className={`text-[7px] font-normal tracking-[0.2em] uppercase ${color} hidden group-hover:block transition-all`}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
};

const ParticipantTile: React.FC<{ 
  participant: Participant; 
  isLocal?: boolean;
  simulatedState?: { isSpeaking: boolean, connection: ConnectionQuality };
  isSolo?: boolean;
  isStage?: boolean;
  isMini?: boolean;
}> = ({ participant, isLocal, simulatedState, isSolo, isStage, isMini }) => {
  const isCurrentlySpeaking = participant.isSpeaking || simulatedState?.isSpeaking;
  const connectionQuality = isLocal ? (participant.connection || 'good') : (simulatedState?.connection || participant.connection || 'good');
  const isSharing = participant.isSharingScreen;
  const isHandRaised = participant.isHandRaised;

  const borderStyle = isSharing
    ? 'border-[2px] border-white/40 shadow-[0_0_50px_rgba(255,255,255,0.1)] z-[30]'
    : isCurrentlySpeaking 
    ? 'border-2 border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.2)] z-10 scale-[0.995]' 
    : 'border border-white/5';

  const avatarSize = isStage ? 'w-48 h-48 text-7xl' : isSolo ? 'w-64 h-64 text-9xl' : isMini ? 'w-12 h-12 text-xl' : 'w-24 h-24 text-4xl';

  return (
    <div className={`relative bg-neutral-950 overflow-hidden flex items-center justify-center transition-all duration-700 w-full h-full group ${borderStyle}`}>
      
      {isCurrentlySpeaking && !isSharing && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute inset-0 border-[3px] border-blue-500/20 animate-orbit-speaking-pulse" />
          <div className="absolute inset-0 border border-blue-400/10 animate-orbit-speaking-pulse-delayed" />
        </div>
      )}

      {isSharing && !isMini && (
        <div className="absolute top-6 right-6 z-40 animate-in fade-in zoom-in duration-500">
           <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-3 py-1.5 border border-white/20">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span className="text-[9px] font-normal text-white uppercase tracking-[0.2em]">Live_Stream</span>
           </div>
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden">
        {isSharing ? (
          <div className="w-full h-full bg-black flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 pointer-events-none z-[5] bg-gradient-to-b from-white/[0.03] to-transparent h-1/2 animate-scanline" />
            <svg className={`text-white opacity-20 mb-4 transition-all duration-700 ${isStage ? 'w-40 h-40' : 'w-16 h-16'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            {!isMini && <span className="text-white/20 text-[10px] font-light uppercase tracking-[0.6em]">Encrypted Data Uplink</span>}
          </div>
        ) : (participant.isVideoOff || participant.role === ParticipantRole.AI) ? (
          <div className="w-full h-full bg-black flex items-center justify-center">
             <div className={`${avatarSize} bg-neutral-900 border border-white/5 flex items-center justify-center font-thin transition-all duration-700 text-white shadow-inner`}>
                {participant.role === ParticipantRole.AI ? (
                  <svg className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                ) : participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
             </div>
          </div>
        ) : (
          <img 
            src={`https://picsum.photos/seed/${participant.id}/1200/1200`} 
            alt={participant.name} 
            className={`w-full h-full object-cover transition-all duration-1000 grayscale opacity-80 ${isCurrentlySpeaking ? 'scale-110 brightness-110 opacity-100 grayscale-0' : ''}`}
          />
        )}
      </div>

      {isHandRaised && (
        <div className={`absolute right-6 bg-white p-2 shadow-2xl z-20 ${isMini ? 'top-2 scale-75' : isSharing ? 'top-16' : 'top-6'}`}>
           <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M10.5 4.5a1.5 1.5 0 113 0v4.382l.224.112A3 3 0 0115.382 11.7l-.427 1.282a5 5 0 01-4.743 3.418H7a1 1 0 01-1-1v-2.122a1 1 0 01.3-.707L8.586 10.3l.164-.164a2.5 2.5 0 00.75-1.768V4.5z" /></svg>
        </div>
      )}

      <div className={`absolute left-6 right-6 flex items-center justify-between z-20 ${isMini ? 'bottom-2 px-1' : 'bottom-6'}`}>
        <div className={`flex items-center gap-3 bg-black/80 backdrop-blur-3xl px-4 py-2 border border-white/10 transition-all duration-500 ${isMini ? 'scale-75 origin-left px-2 py-1' : ''}`}>
          <span className="text-white text-[11px] font-normal uppercase tracking-[0.2em]">{participant.name || 'USER'} {isLocal ? '(YOU)' : ''}</span>
          {isSharing && <span className="text-[8px] font-light text-neutral-500 uppercase tracking-widest">[SHARING]</span>}
          {participant.isMuted && (
            <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          )}
        </div>
        {!isMini && <ConnectionIndicator quality={connectionQuality} />}
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scanline { animation: scanline 4s linear infinite; }
        @keyframes orbit-speaking-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.05); opacity: 0; }
        }
        .animate-orbit-speaking-pulse { animation: orbit-speaking-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-orbit-speaking-pulse-delayed { animation: orbit-speaking-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.75s; }
      `}</style>
    </div>
  );
};

export default ParticipantGrid;
