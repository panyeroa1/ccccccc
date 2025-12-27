
import React, { useEffect, useRef } from 'react';
import { Participant, ParticipantRole } from '../types';

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

  // Orbit Design System: Restrained electric blue for key focus states
  const borderStyle = isSharing
    ? 'border-[2px] border-white/40 shadow-[0_0_80px_rgba(255,255,255,0.15)] z-[30]'
    : isCurrentlySpeaking 
    ? 'border-2 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.4)] z-10 scale-[0.998]' 
    : 'border border-white/5';

  const avatarSize = isStage ? 'w-48 h-48 text-7xl' : isSolo ? 'w-64 h-64 text-9xl' : isMini ? 'w-12 h-12 text-xl' : 'w-24 h-24 text-4xl';

  return (
    <div className={`relative bg-black overflow-hidden flex items-center justify-center transition-all duration-700 w-full h-full group ${borderStyle}`}>
      
      {/* Speaking Indicator: High-fidelity electric blue pulse */}
      {isCurrentlySpeaking && !isSharing && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div className="absolute inset-0 border-[4px] border-blue-500/30 animate-orbit-speaking-pulse" />
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden bg-neutral-950">
        {(!stream || participant.isVideoOff || participant.role === ParticipantRole.AI) ? (
          <div className="w-full h-full bg-black flex items-center justify-center">
             <div className={`${avatarSize} bg-neutral-900 border border-white/5 flex items-center justify-center font-thin transition-all duration-700 text-white shadow-inner`}>
                {participant.role === ParticipantRole.AI ? (
                  <svg className="w-1/2 h-1/2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                ) : participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
             </div>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={`w-full h-full object-cover transition-all duration-1000 grayscale-[0.2] ${isLocal && participant.isMirrored ? 'scale-x-[-1]' : ''} ${isCurrentlySpeaking ? 'grayscale-0 brightness-[1.05]' : ''}`}
            style={{
                filter: participant.isBeautified ? 'contrast(1.05) brightness(1.02) saturate(0.9) blur(0.2px)' : 'none'
            }}
          />
        )}
      </div>

      <div className={`absolute left-6 right-6 flex items-center justify-between z-20 ${isMini ? 'bottom-2 px-1' : 'bottom-6'}`}>
        <div className={`flex items-center gap-3 bg-black/95 backdrop-blur-3xl px-5 py-2.5 border border-white/10 transition-all duration-500 ${isMini ? 'scale-75 origin-left px-2 py-1' : ''}`}>
          {/* Synchronized blue status orb */}
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isCurrentlySpeaking ? 'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-neutral-800'}`} />
          <span className={`text-[10px] font-normal uppercase tracking-[0.3em] transition-colors duration-300 ${isCurrentlySpeaking ? 'text-white' : 'text-neutral-500'}`}>
            {participant.name || 'ANON'} {isLocal ? '(YOU)' : ''}
          </span>
        </div>
      </div>
      
      <style>{`
        @keyframes orbit-speaking-pulse {
          0% { transform: scale(1); opacity: 0.2; box-shadow: inset 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { transform: scale(1.01); opacity: 0.6; box-shadow: inset 0 0 20px 2px rgba(59, 130, 246, 0.2); }
          100% { transform: scale(1); opacity: 0.2; box-shadow: inset 0 0 0 0 rgba(59, 130, 246, 0.4); }
        }
        .animate-orbit-speaking-pulse { 
          animation: orbit-speaking-pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; 
        }
      `}</style>
    </div>
  );
};

export default ParticipantTile;
