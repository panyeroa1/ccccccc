
import React from 'react';

interface ControlDockProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isVideoOff: boolean;
  onToggleVideo: () => void;
  isSharingScreen: boolean;
  onToggleScreenShare: () => void;
  isHandRaised: boolean;
  onToggleHand: () => void;
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
  onLeave, 
  onToggleSidebar, activeSidebarTab,
  aiActive, aiConnecting, onToggleAi
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
      <div className="flex items-center gap-2 bg-[#1e1e1e]/90 backdrop-blur-xl px-4 py-3 rounded-full border border-white/10 shadow-2xl">
        {/* Media Controls */}
        <ControlButton 
          onClick={onToggleMute} 
          active={!isMuted} 
          danger={isMuted}
          icon={isMuted ? <MuteIcon /> : <MicIcon />}
          tooltip={isMuted ? "Unmute" : "Mute"}
        />
        <ControlButton 
          onClick={onToggleVideo} 
          active={!isVideoOff} 
          danger={isVideoOff}
          icon={isVideoOff ? <VideoOffIcon /> : <VideoOnIcon />}
          tooltip={isVideoOff ? "Start Camera" : "Stop Camera"}
        />
        
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Action Controls */}
        <ControlButton 
          onClick={onToggleScreenShare} 
          active={isSharingScreen} 
          icon={<ScreenShareIcon />}
          tooltip="Share Screen"
        />
        <ControlButton 
          onClick={onToggleHand} 
          active={isHandRaised} 
          icon={<HandIcon />}
          tooltip="Raise Hand"
          activeColor="bg-yellow-500"
        />
        <ControlButton 
          onClick={onToggleAi} 
          active={aiActive} 
          loading={aiConnecting}
          icon={<AiIcon />}
          tooltip="Orbit Assistant"
          activeColor="bg-blue-600"
        />

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Sidebar Toggles */}
        <ControlButton 
          onClick={() => onToggleSidebar('chat')} 
          active={activeSidebarTab === 'chat'} 
          icon={<ChatIcon />}
          tooltip="Chat"
        />
        <ControlButton 
          onClick={() => onToggleSidebar('participants')} 
          active={activeSidebarTab === 'participants'} 
          icon={<PeopleIcon />}
          tooltip="Participants"
        />

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Hangup */}
        <button 
          onClick={onLeave}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg active:scale-95 group relative"
        >
          <HangupIcon />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Leave Meeting</span>
        </button>
      </div>
    </div>
  );
};

const ControlButton: React.FC<{ 
  onClick: () => void; 
  active?: boolean; 
  danger?: boolean;
  loading?: boolean;
  icon: React.ReactNode; 
  tooltip: string;
  activeColor?: string;
}> = ({ onClick, active, danger, loading, icon, tooltip, activeColor = 'bg-[#3d3d3d]' }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all group relative active:scale-95 ${loading ? 'opacity-50 cursor-wait' : ''} ${danger ? 'bg-red-500 text-white' : active ? `${activeColor} text-white` : 'bg-transparent text-neutral-400 hover:bg-white/5'}`}
  >
    {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : icon}
    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{tooltip}</span>
  </button>
);

// Minimalist Icons
const MicIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 10v1a7 7 0 01-14 0v-1m14 0a7 7 0 01-7 7m0 0a7 7 0 01-7-7" /></svg>;
const MuteIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const VideoOnIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const VideoOffIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const ScreenShareIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const HandIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5a1.5 1.5 0 113 0v4.382l.224.112A3 3 0 0115.382 11.7l-.427 1.282a5 5 0 01-4.743 3.418H7a1 1 0 01-1-1v-2.122a1 1 0 01.3-.707L8.586 10.3l.164-.164a2.5 2.5 0 00.75-1.768V4.5z" /></svg>;
const AiIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ChatIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const PeopleIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const HangupIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4c-4.41 0-8 3.59-8 8v1.45l2.42-2.42c.39-.39 1.02-.39 1.41 0l1.22 1.22c.39.39.39 1.02 0 1.41L6.41 16.41c-.39.39-1.02.39-1.41 0L2.29 13.71c-.39-.39-.39-1.02 0-1.41l1.42-1.42C4.12 6.54 8.65 3 14 3c5.35 0 9.88 3.54 10.29 8.88l1.42 1.42c.39.39.39 1.02 0 1.41l-2.71 2.71c-.39.39-1.02.39-1.41 0l-2.64-2.64c-.39-.39-.39-1.02 0-1.41l1.22-1.22c.39-.39.39-1.02 0-1.41L21.55 13.45V12c0-4.41-3.59-8-8-8z" /></svg>;

export default ControlDock;
