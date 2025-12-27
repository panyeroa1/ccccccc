
import React, { useEffect, useRef } from 'react';
import { Participant, ParticipantRole, ConnectionQuality } from '../types';

interface ParticipantTileProps {
  participant: Participant;
  stream?: MediaStream | null;
  isLocal?: boolean;
  isSolo?: boolean;
  isStage?: boolean;
  isMini?: boolean;
}

const ParticipantTile: React.FC<ParticipantTileProps> = ({ 
  participant, stream, isLocal, isSolo, isStage, isMini 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const isCurrentlySpeaking = participant.isSpeaking;
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
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden">
        {(!stream || participant.isVideoOff || participant.role === ParticipantRole.AI) ? (
          <div className="w-full h-full bg-black flex items-center justify-center">
             <div className={`${avatarSize} bg-neutral-900 border border-white/5 flex items-center justify-center font-thin transition-all duration-700 text-white shadow-inner`}>
                {participant.role === ParticipantRole.AI ? (
                  <svg className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                ) : participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
             </div>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={`w-full h-full object-cover transition-all duration-1000 grayscale-[0.3] opacity-90 ${isLocal ? 'scale-x-[-1]' : ''} ${isCurrentlySpeaking ? 'grayscale-0 opacity-100 scale-[1.02]' : ''}`}
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
          {participant.isMuted && (
            <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantTile;
