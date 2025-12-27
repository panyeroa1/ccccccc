
import React, { useMemo } from 'react';
import { Participant } from '../types';
import ParticipantTile from './ParticipantTile';

interface ParticipantGridProps {
  participants: Participant[];
  localParticipantId: string;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
}

const ParticipantGrid: React.FC<ParticipantGridProps> = ({ 
  participants, localParticipantId, localStream, remoteStreams 
}) => {
  const sharer = useMemo(() => participants.find(p => p.isSharingScreen), [participants]);
  const others = useMemo(() => participants.filter(p => p.id !== sharer?.id), [participants, sharer]);

  const getGridConfig = () => {
    const count = participants.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
  };

  return (
    <div className="w-full h-full relative bg-black pt-16 overflow-hidden">
      {sharer && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[45] flex items-center animate-in slide-in-from-top-10 duration-700 pointer-events-none">
          <div className="flex items-center gap-4 bg-black/90 backdrop-blur-3xl px-6 py-2.5 border border-white/10 shadow-2xl">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="text-[10px] font-light text-white uppercase tracking-[0.4em]">
              Viewing {sharer.name}'s screen
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
              stream={sharer.id === localParticipantId ? localStream : remoteStreams[sharer.id]}
              isStage={true}
            />
          </div>
          <div className="w-full md:w-72 h-40 md:h-full bg-black/50 border-l border-white/5 overflow-x-auto md:overflow-y-auto flex md:flex-col p-2 gap-2">
            {others.map((p) => (
              <div key={p.id} className="min-w-[160px] md:min-w-0 aspect-video md:aspect-square flex-shrink-0">
                <ParticipantTile 
                  participant={p} 
                  isLocal={p.id === localParticipantId} 
                  stream={p.id === localParticipantId ? localStream : remoteStreams[p.id]}
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
              stream={p.id === localParticipantId ? localStream : remoteStreams[p.id]}
              isSolo={participants.length === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantGrid;
