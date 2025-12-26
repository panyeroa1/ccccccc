
import React, { useState, useEffect, useRef } from 'react';
import { Participant, ChatMessage } from '../types';

interface SidebarProps {
  isOpen: boolean;
  tab: 'chat' | 'participants';
  onClose: () => void;
  messages: ChatMessage[];
  participants: Participant[];
  onSendMessage: (text: string) => void;
  onKick?: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, tab, onClose, messages, participants, onSendMessage, onKick }) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
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
    <div className={`fixed top-0 bottom-0 right-0 w-[380px] bg-neutral-900/40 backdrop-blur-3xl border-l border-white/5 shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-8 border-b border-white/5">
        <div className="flex items-center gap-3">
           <h2 className="text-xl font-bold text-white capitalize">{tab}</h2>
           {tab === 'participants' && (
             <span className="bg-white/5 text-neutral-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{participants.length}</span>
           )}
        </div>
        <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-full transition-colors text-neutral-500 hover:text-white">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Scrollable Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {tab === 'chat' ? (
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-neutral-600 text-center gap-4">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                 </div>
                 <p className="text-xs font-medium tracking-tight">Meeting chat is empty.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === 'local-user' ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{msg.senderName}</span>
                    <span className="text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-[90%] text-sm leading-relaxed ${msg.senderId === 'local-user' ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10' : 'bg-neutral-800 text-neutral-200 rounded-tl-none border border-white/5'}`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {participants.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold border ${p.role === 'AI' ? 'bg-blue-600/10 border-blue-600/30 text-blue-500' : 'bg-neutral-800 border-white/5 text-neutral-500'}`}>
                      {p.role === 'AI' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> : p.name.charAt(0)}
                    </div>
                    {p.isSpeaking && (
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-neutral-900 animate-pulse" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white tracking-tight">{p.name} {p.id === 'local-user' && '(You)'}</span>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">{p.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                   {p.id !== 'local-user' && p.role !== 'AI' && (
                     <button 
                      onClick={() => onKick?.(p.id)}
                      className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-500 hover:text-red-500 transition-colors"
                      title="Remove participant"
                     >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
                     </button>
                   )}
                   <button className="p-2 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer (Chat input) */}
      {tab === 'chat' && (
        <div className="p-8 border-t border-white/5 bg-neutral-950/20">
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-neutral-800/50 border border-white/5 rounded-[1.25rem] py-4 px-6 pr-14 text-sm text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-blue-600 transition-all focus:bg-neutral-800"
              placeholder="Message everyone..."
            />
            <button type="submit" disabled={!inputValue.trim()} className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-[1rem] hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 transition-all shadow-lg shadow-blue-600/10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
