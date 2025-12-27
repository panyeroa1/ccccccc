
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

  const emojis = ['❤️', '😂', '😮', '😢', '👍', '👏', '🔥', '🎉'];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
      <div className="flex items-center gap-2 bg-[#1e1e1e]/90 backdrop-blur-xl px-4 py-3 rounded-full border border-white/10 shadow-2xl">
        {/* Media Group */}
        <div className="flex items-center gap-1.5">
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
        </div>
        
        <Separator />

        {/* Core Actions Group */}
        <div className="flex items-center gap-1.5">
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
          
          {/* Reactions Button with Popover */}
          <div className="relative">
            <ControlButton 
              onClick={() => setShowReactions(!showReactions)} 
              active={showReactions} 
              icon={<ReactionIcon />}
              tooltip="Reactions"
              activeColor="bg-purple-600"
            />
            {showReactions && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#111] border border-white/10 p-2 rounded-2xl flex gap-1 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
                {emojis.map(e => (
                  <button 
                    key={e}
                    onClick={() => { onReaction(e); setShowReactions(false); }}
                    className="w-10 h-10 flex items-center justify-center text-xl hover:bg-white/5 rounded-xl transition-all active:scale-90"
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
            tooltip="Orbit Assistant"
            activeColor="bg-blue-600"
          />
        </div>

        <Separator />

        {/* Productivity Tools Group */}
        <div className="flex items-center gap-1.5">
          <ControlButton 
            onClick={onToggleCaptions} 
            active={isCaptionsActive} 
            icon={<CaptionIcon />}
            tooltip="Live Captions"
            activeColor="bg-blue-500"
          />
          <ControlButton 
            onClick={onToggleRecording} 
            active={isRecording} 
            icon={<RecordIcon />}
            tooltip={isRecording ? "Stop Recording" : "Record Meeting"}
            activeColor="bg-red-600"
          />
          <ControlButton 
            onClick={onOpenIntegrations} 
            icon={<IntegrationIcon />}
            tooltip="Integrations"
          />
        </div>

        <Separator />

        {/* UI & System Group */}
        <div className="flex items-center gap-1.5">
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
          <ControlButton 
            onClick={onOpenSettings} 
            icon={<SettingsIcon />}
            tooltip="Settings"
          />
        </div>

        <Separator />

        {/* Termination */}
        <button 
          onClick={onLeave}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg active:scale-95 group relative ml-1"
        >
          <HangupIcon />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Leave Meeting</span>
        </button>
      </div>
    </div>
  );
};

const Separator = () => <div className="w-px h-6 bg-white/10 mx-0.5" />;

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
    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all group relative active:scale-95 ${loading ? 'opacity-50 cursor-wait' : ''} ${danger ? 'bg-red-500 text-white' : active ? `${activeColor} text-white shadow-lg` : 'bg-transparent text-neutral-400 hover:bg-white/5'}`}
  >
    {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : icon}
    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] border border-white/5">{tooltip}</span>
  </button>
);

// Icons
const MicIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 10v1a7 7 0 01-14 0v-1m14 0a7 7 0 01-7 7m0 0a7 7 0 01-7-7" /></svg>;
const MuteIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const VideoOnIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const VideoOffIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const ScreenShareIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const HandIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5a1.5 1.5 0 113 0v4.382l.224.112A3 3 0 0115.382 11.7l-.427 1.282a5 5 0 01-4.743 3.418H7a1 1 0 01-1-1v-2.122a1 1 0 01.3-.707L8.586 10.3l.164-.164a2.5 2.5 0 00.75-1.768V4.5z" /></svg>;
const ReactionIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AiIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ChatIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const PeopleIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CaptionIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>;
const RecordIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><circle cx="12" cy="12" r="3" strokeWidth={3} /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 110 20 10 10 0 010-20z" /></svg>;
const IntegrationIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 11-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 011-1V4z" /></svg>;
const HangupIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4c-4.41 0-8 3.59-8 8v1.45l2.42-2.42c.39-.39 1.02-.39 1.41 0l1.22 1.22c.39.39.39 1.02 0 1.41L6.41 16.41c-.39.39-1.02.39-1.41 0L2.29 13.71c-.39-.39-.39-1.02 0-1.41l1.42-1.42C4.12 6.54 8.65 3 14 3c5.35 0 9.88 3.54 10.29 8.88l1.42 1.42c.39.39.39 1.02 0 1.41l-2.71 2.71c-.39.39-1.02.39-1.41 0l-2.64-2.64c-.39-.39-.39-1.02 0-1.41l1.22-1.22c.39-.39.39-1.02 0-1.41L21.55 13.45V12c0-4.41-3.59-8-8-8z" /></svg>;

export default ControlDock;
