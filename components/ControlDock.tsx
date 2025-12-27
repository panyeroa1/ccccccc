
import React, { useState } from 'react';

interface ControlDockProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isVideoOff: boolean;
  onToggleVideo: () => void;
  isSharingScreen: boolean;
  onToggleScreenShare: () => void;
  isHandRaised: boolean;
  onToggleHand: () => void;
  isCaptionsActive: boolean;
  onToggleCaptions: () => void;
  isTranslateActive: boolean;
  onToggleTranslate: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  onReaction: (emoji: string) => void;
  onOpenIntegrations: () => void;
  onOpenSettings: () => void;
  onLeave: () => void;
  onToggleSidebar: (tab: 'chat' | 'participants') => void;
  activeSidebarTab: 'chat' | 'participants' | null;
  aiActive: boolean;
  aiConnecting: boolean;
  onToggleAi: () => void;
  onTranscribe: (blob: Blob) => void;
}

const ControlDock: React.FC<ControlDockProps> = ({ 
  isMuted, onToggleMute, 
  isVideoOff, onToggleVideo, 
  isSharingScreen, onToggleScreenShare,
  isHandRaised, onToggleHand,
  isCaptionsActive, onToggleCaptions,
  isTranslateActive, onToggleTranslate,
  isRecording, onToggleRecording,
  onReaction,
  onOpenIntegrations,
  onOpenSettings,
  onLeave, 
  onToggleSidebar, activeSidebarTab,
  aiActive, aiConnecting, onToggleAi
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const emojis = ['🤍', '💀', '🌚', '🌪️', '🌑', '🪨', '🌑', '🕯️'];

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
      <div className="flex items-center gap-3 bg-black/90 backdrop-blur-3xl px-6 py-4 rounded-none border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2">
          <ControlButton 
            onClick={onToggleMute} 
            active={!isMuted} 
            danger={isMuted}
            icon={isMuted ? <MuteIcon /> : <MicIcon />}
            tooltip={isMuted ? "ENABLE_AUDIO" : "DISABLE_AUDIO"}
          />
          <ControlButton 
            onClick={onToggleVideo} 
            active={!isVideoOff} 
            danger={isVideoOff}
            icon={isVideoOff ? <VideoOffIcon /> : <VideoOnIcon />}
            tooltip={isVideoOff ? "ENABLE_OPTIC" : "DISABLE_OPTIC"}
          />
        </div>
        
        <Separator />

        <div className="flex items-center gap-2">
          <ControlButton 
            onClick={onToggleScreenShare} 
            active={isSharingScreen} 
            icon={<ScreenShareIcon />}
            tooltip="BROADCAST_SCREEN"
          />
          <ControlButton 
            onClick={onToggleHand} 
            active={isHandRaised} 
            icon={<HandIcon />}
            tooltip="SIGNAL_HOST"
          />
          
          <div className="relative">
            <ControlButton 
              onClick={() => setShowReactions(!showReactions)} 
              active={showReactions} 
              icon={<ReactionIcon />}
              tooltip="EMOTE"
            />
            {showReactions && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black border border-white/10 p-3 rounded-none flex gap-2 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                {emojis.map(e => (
                  <button 
                    key={e}
                    onClick={() => { onReaction(e); setShowReactions(false); }}
                    className="w-12 h-12 flex items-center justify-center text-2xl hover:bg-white/5 transition-all active:scale-90"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ControlButton 
            onClick={onToggleAi} 
            active={aiActive} 
            loading={aiConnecting}
            icon={<AiIcon />}
            tooltip="ORBIT_AI"
            activeColor="bg-white"
            activeIconColor="text-black"
          />
        </div>

        <Separator />

        <div className="flex items-center gap-2">
          <ControlButton 
            onClick={onToggleCaptions} 
            active={isCaptionsActive} 
            icon={<CaptionIcon />}
            tooltip="TEXT_FEED"
          />
          <ControlButton 
            onClick={onToggleRecording} 
            active={isRecording} 
            icon={<RecordIcon />}
            tooltip={isRecording ? "END_ARCHIVE" : "START_ARCHIVE"}
            activeColor="bg-white"
            activeIconColor="text-black"
          />
        </div>

        <Separator />

        <div className="flex items-center gap-2">
          <ControlButton 
            onClick={() => onToggleSidebar('chat')} 
            active={activeSidebarTab === 'chat'} 
            icon={<ChatIcon />}
            tooltip="COMMS"
          />
          <ControlButton 
            onClick={() => onToggleSidebar('participants')} 
            active={activeSidebarTab === 'participants'} 
            icon={<PeopleIcon />}
            tooltip="IDENTITY_ROSTER"
          />
          <ControlButton 
            onClick={onOpenSettings} 
            icon={<SettingsIcon />}
            tooltip="SYSTEM_CONFIG"
          />
        </div>

        <Separator />

        <button 
          onClick={onLeave}
          className="w-14 h-14 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white transition-all shadow-xl active:scale-95 group relative ml-2"
        >
          <HangupIcon />
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-neutral-900 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/5">TERMINATE_SESSION</span>
        </button>
      </div>
    </div>
  );
};

const Separator = () => <div className="w-px h-8 bg-white/5 mx-2" />;

const ControlButton: React.FC<{ 
  onClick: () => void; 
  active?: boolean; 
  danger?: boolean;
  loading?: boolean;
  icon: React.ReactNode; 
  tooltip: string;
  activeColor?: string;
  activeIconColor?: string;
}> = ({ onClick, active, danger, loading, icon, tooltip, activeColor = 'bg-neutral-800', activeIconColor = 'text-white' }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`w-12 h-12 flex items-center justify-center transition-all group relative active:scale-95 ${loading ? 'opacity-30 cursor-wait' : ''} ${danger ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : active ? `${activeColor} ${activeIconColor} shadow-[0_0_30px_rgba(255,255,255,0.1)]` : 'bg-transparent text-neutral-600 hover:text-white hover:bg-white/5'}`}
  >
    {loading ? <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" /> : icon}
    <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-neutral-950 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] border border-white/5">{tooltip}</span>
  </button>
);

const MicIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 10v1a7 7 0 01-14 0v-1m14 0a7 7 0 01-7 7m0 0a7 7 0 01-7-7" /></svg>;
const MuteIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const VideoOnIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const VideoOffIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const ScreenShareIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const HandIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5a1.5 1.5 0 113 0v4.382l.224.112A3 3 0 0115.382 11.7l-.427 1.282a5 5 0 01-4.743 3.418H7a1 1 0 01-1-1v-2.122a1 1 0 01.3-.707L8.586 10.3l.164-.164a2.5 2.5 0 00.75-1.768V4.5z" /></svg>;
const ReactionIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AiIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ChatIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const PeopleIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const SettingsIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CaptionIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>;
const RecordIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><circle cx="12" cy="12" r="3" strokeWidth={4} /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 110 20 10 10 0 010-20z" /></svg>;
const HangupIcon = () => <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4c-4.41 0-8 3.59-8 8v1.45l2.42-2.42c.39-.39 1.02-.39 1.41 0l1.22 1.22c.39.39.39 1.02 0 1.41L6.41 16.41c-.39.39-1.02.39-1.41 0L2.29 13.71c-.39-.39-.39-1.02 0-1.41l1.42-1.42C4.12 6.54 8.65 3 14 3c5.35 0 9.88 3.54 10.29 8.88l1.42 1.42c.39.39.39 1.02 0 1.41l-2.71 2.71c-.39.39-1.02.39-1.41 0l-2.64-2.64c-.39-.39-.39-1.02 0-1.41l1.22-1.22c.39-.39.39-1.02 0-1.41L21.55 13.45V12c0-4.41-3.59-8-8-8z" /></svg>;

export default ControlDock;
