
import React, { useState, useEffect, useRef } from 'react';
import { Participant, ChatMessage, SidebarTab, ParticipantRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  tab: SidebarTab;
  onClose: () => void;
  messages: ChatMessage[];
  participants: Participant[];
  onSendMessage: (text: string) => void;
  onKick?: (id: string) => void;
  roomName?: string;
  passcode?: string;
  onCopyInvite?: () => void;
  localParticipantId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, tab, onClose, messages, participants, onSendMessage, onKick, 
  roomName, passcode, onCopyInvite, localParticipantId
}) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleCopyInvite = () => {
    const inviteText = `Join my Orbit meeting:
Link: ${window.location.origin}/orbit.ai/${roomName}
Room ID: ${roomName}
Passcode: ${passcode}`;
    
    navigator.clipboard.writeText(inviteText);
    onCopyInvite?.();
  };

  return (
    <div className={`fixed top-0 bottom-0 right-0 w-[400px] bg-black border-l border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-700 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-24 flex items-center justify-between px-10 border-b border-white/5">
        <div className="flex items-center gap-4">
           <h2 className="text-sm font-light text-white uppercase tracking-[0.5em]">{tab}</h2>
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white/5 transition-colors text-neutral-600 hover:text-white">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8">
        {tab === 'chat' ? (
          <div className="space-y-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 text-neutral-800 text-center gap-6">
                 <svg className="w-16 h-16 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                 <p className="text-[10px] font-light uppercase tracking-[0.4em]">Channel_Silent</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === localParticipantId ? 'items-end' : 'items-start'} group animate-in slide-in-from-bottom-5 duration-500`}>
                  <div className="flex items-center gap-3 mb-2 px-1">
                    <span className="text-[9px] font-normal text-neutral-600 uppercase tracking-widest">{msg.senderName}</span>
                    <span className="text-[8px] font-normal text-neutral-800 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">[{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                  </div>
                  <div className={`px-5 py-4 text-xs font-light leading-relaxed tracking-normal ${msg.senderId === localParticipantId ? 'bg-white/10 text-white shadow-xl' : 'bg-neutral-900/50 text-neutral-400 border border-white/5'}`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : tab === 'participants' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <span className="text-[10px] font-normal text-neutral-500 uppercase tracking-[0.4em]">Active_{participants.length}</span>
              <button className="text-[9px] font-normal text-neutral-600 hover:text-white transition-colors uppercase tracking-[0.2em]">Mute All</button>
            </div>
            <div className="space-y-2">
              {participants.map(p => (
                <div key={p.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 flex items-center justify-center text-sm font-thin border ${p.role === ParticipantRole.AI ? 'bg-white text-black' : 'bg-neutral-900 border-white/5 text-neutral-400'}`}>
                      {p.role === ParticipantRole.AI ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> : p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-light text-white uppercase tracking-widest">{p.name} {p.id === localParticipantId && '(YOU)'}</span>
                      <span className="text-[8px] font-light text-neutral-700 uppercase tracking-[0.3em] mt-1">{p.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                     {p.id !== localParticipantId && p.role !== ParticipantRole.AI && (
                       <button onClick={() => onKick?.(p.id)} className="p-2 text-red-900/50 hover:text-red-500 transition-colors uppercase font-normal text-[9px] tracking-widest">KICK</button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="space-y-6">
                <label className="text-[10px] font-normal text-neutral-600 uppercase tracking-[0.4em]">Meeting Uplink</label>
                <div className="bg-neutral-900 border border-white/5 p-6 flex items-center justify-between">
                   <span className="text-xs font-normal text-white tracking-tight truncate mr-4">orbit.ai/{roomName}</span>
                   <button 
                     onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/orbit.ai/${roomName}`); onCopyInvite?.(); }}
                     className="p-3 bg-white text-black hover:bg-neutral-200 transition-all"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                   <label className="text-[10px] font-normal text-neutral-600 uppercase tracking-[0.4em]">Room_ID</label>
                   <div className="bg-neutral-900 border border-white/5 p-6 text-white text-xl font-light uppercase tracking-normal">
                      {roomName}
                   </div>
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-normal text-neutral-600 uppercase tracking-[0.4em]">Passcode</label>
                   <div className="bg-neutral-900 border border-white/5 p-6 text-white text-xl font-light tracking-widest">
                      {passcode}
                   </div>
                </div>
             </div>

             <div className="pt-12 border-t border-white/5">
                <button 
                  onClick={handleCopyInvite}
                  className="w-full py-6 bg-white hover:bg-neutral-200 text-black text-xs font-normal uppercase tracking-[0.5em] transition-all shadow-xl active:scale-[0.98]"
                >
                  Copy Full Invite
                </button>
                <p className="mt-6 text-[9px] font-light text-neutral-700 uppercase tracking-[0.3em] text-center leading-relaxed">
                   Authorized void-protocol transmission only.
                </p>
             </div>
          </div>
        )}
      </div>

      {tab === 'chat' && (
        <div className="p-10 border-t border-white/5">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-neutral-950 border border-white/5 py-5 px-6 pr-16 text-xs text-white placeholder-neutral-800 outline-none focus:border-white transition-all font-light tracking-normal"
              placeholder="BROADCAST_MESSAGE"
            />
            <button type="submit" disabled={!inputValue.trim()} className="absolute right-3 top-2 bottom-2 px-3 bg-white text-black disabled:bg-neutral-900 disabled:text-neutral-700 transition-all font-normal text-[10px] tracking-widest uppercase">
              SEND
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
