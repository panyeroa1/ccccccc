
import React, { useState, useEffect, useRef } from 'react';
import { Participant, ChatMessage, SidebarTab, ParticipantRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  tab: SidebarTab;
  onClose: () => void;
  messages: ChatMessage[];
  participants: Participant[];
  onSendMessage: (text: string) => void;
  onModeration?: (id: string, type: 'MUTE' | 'KICK' | 'ADMIT' | 'DENY') => void;
  roomName?: string;
  passcode?: string;
  onCopyInvite?: () => void;
  localParticipantId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, tab, onClose, messages, participants, onSendMessage, onModeration, 
  roomName, passcode, onCopyInvite, localParticipantId
}) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const localUser = participants.find(p => p.id === localParticipantId);
  const isHost = localUser?.role === ParticipantRole.HOST;

  useEffect(() => {
    if (scrollRef.current && tab === 'chat') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, tab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={`fixed top-0 bottom-0 right-0 w-[400px] bg-black border-l border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-700 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-24 flex items-center justify-between px-10 border-b border-white/5">
        <h2 className="text-sm font-light text-white uppercase tracking-[0.5em]">{tab}</h2>
        <button onClick={onClose} className="p-3 text-neutral-600 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={1} /></svg></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8">
        {tab === 'chat' && (
          <div className="space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.senderId === localParticipantId ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-neutral-600 uppercase mb-1">{msg.senderName}</span>
                <div className={`px-4 py-3 text-xs font-light ${msg.senderId === localParticipantId ? 'bg-white/10 text-white' : 'bg-neutral-900 text-neutral-400 border border-white/5'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'participants' && (
          <div className="space-y-4">
            {/* Waiting List */}
            {isHost && participants.some(p => p.status === 'waiting') && (
              <div className="space-y-4 mb-10">
                <h3 className="text-[10px] text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">Waiting Room</h3>
                {participants.filter(p => p.status === 'waiting').map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-neutral-900/50 border border-white/5">
                    <span className="text-xs text-white font-light">{p.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => onModeration?.(p.id, 'ADMIT')} className="text-[8px] bg-white text-black px-2 py-1 uppercase tracking-tighter">Admit</button>
                      <button onClick={() => onModeration?.(p.id, 'DENY')} className="text-[8px] border border-white/10 text-neutral-600 px-2 py-1 uppercase tracking-tighter">Deny</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <h3 className="text-[10px] text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">In Call</h3>
            {participants.filter(p => p.status === 'approved').map(p => (
              <div key={p.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-900 border border-white/10 flex items-center justify-center text-xs text-white">{p.name.charAt(0)}</div>
                  <div className="flex flex-col">
                    <span className="text-xs text-white">{p.name} {p.id === localParticipantId && '(YOU)'}</span>
                    <span className="text-[8px] text-neutral-700 uppercase">{p.role}</span>
                  </div>
                </div>
                {isHost && p.id !== localParticipantId && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onModeration?.(p.id, 'MUTE')} className="text-[8px] text-neutral-500 hover:text-white uppercase">Mute</button>
                    <button onClick={() => onModeration?.(p.id, 'KICK')} className="text-[8px] text-red-900 hover:text-red-500 uppercase">Kick</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'info' && (
          <div className="space-y-10">
             <div className="space-y-4">
               <label className="text-[10px] text-neutral-600 uppercase">Invite Link</label>
               <div className="bg-neutral-900 p-4 text-xs text-white truncate border border-white/5">orbit.ai/{roomName}</div>
             </div>
             <button onClick={() => { navigator.clipboard.writeText(`orbit.ai/${roomName}`); }} className="w-full py-5 bg-white text-black text-[10px] uppercase tracking-[0.4em]">Copy Link</button>
          </div>
        )}
      </div>

      {tab === 'chat' && (
        <div className="p-8 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex">
            <input 
              type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent border-b border-white/10 py-3 text-xs text-white outline-none focus:border-white"
              placeholder="SEND_SIGNAL"
            />
            <button type="submit" className="ml-4 text-white text-[10px] uppercase">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
