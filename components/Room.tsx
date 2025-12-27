
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Participant, ParticipantRole, ChatMessage, DeviceSettings, ToastMessage, ConnectionQuality, LiveCaption, SidebarTab, RoomCommand } from '../types';
import ParticipantGrid from './ParticipantGrid';
import ControlDock from './ControlDock';
import Sidebar from './Sidebar';
import SettingsPage from './SettingsPage';
import CaptionOverlay from './CaptionOverlay';
import ScreenShareModal from './ScreenShareModal';
import Logo from './Logo';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { 
  fetchMessages, 
  sendMessageToSupabase, 
  subscribeToMessages, 
  syncParticipant, 
  fetchParticipants, 
  subscribeToParticipants,
  upsertCaption,
  subscribeToCaptions,
  sendRoomCommand,
  subscribeToCommands
} from '../services/supabaseService';

interface RoomProps {
  userName: string;
  roomName: string;
  onLeave: () => void;
  devices: DeviceSettings;
}

const Room: React.FC<RoomProps> = ({ userName, roomName, onLeave, devices: initialDevices }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [showScreenShareModal, setShowScreenShareModal] = useState(false);
  const [currentDevices, setCurrentDevices] = useState<DeviceSettings>(initialDevices);
  
  const passcode = useMemo(() => Math.floor(100000 + Math.random() * 900000).toString(), []);
  const localParticipantId = useMemo(() => `${userName.toLowerCase().replace(/\s/g, '-')}-${passcode.slice(0,3)}`, [userName, passcode]);

  const [activeCaption, setActiveCaption] = useState<LiveCaption | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isCaptionsActive, setIsCaptionsActive] = useState(false);
  const [isTranslateActive, setIsTranslateActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [myStatus, setMyStatus] = useState<'waiting' | 'approved' | 'denied'>('waiting');
  const [reaction, setReaction] = useState<string | undefined>(undefined);

  const addToast = useCallback((text: string, type: 'info' | 'error' | 'success' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Sync self to DB
  useEffect(() => {
    const heartbeat = setInterval(() => {
      syncParticipant(roomName, {
        id: localParticipantId,
        name: userName,
        role: participants.length === 0 ? ParticipantRole.HOST : ParticipantRole.PARTICIPANT,
        status: myStatus,
        isMuted,
        isVideoOff,
        isSharingScreen,
        isSpeaking: false,
        isHandRaised,
        reaction
      });
    }, 4000);
    return () => clearInterval(heartbeat);
  }, [roomName, userName, localParticipantId, isMuted, isVideoOff, isSharingScreen, isHandRaised, myStatus, reaction, participants.length]);

  // Global Listeners (Participants, Commands, Messages)
  useEffect(() => {
    const refreshParticipants = async () => {
      const roster = await fetchParticipants(roomName);
      setParticipants(roster);
      const me = roster.find(p => p.id === localParticipantId);
      if (me && me.status !== myStatus) setMyStatus(me.status);
    };

    refreshParticipants();
    const subP = subscribeToParticipants(roomName, refreshParticipants);
    const subM = subscribeToMessages(roomName, (m) => setMessages(prev => [...prev, m]));
    const subC = subscribeToCommands(roomName, (cmd: RoomCommand) => {
      if (cmd.targetId === localParticipantId || cmd.targetId === 'all') {
        if (cmd.type === 'MUTE') setIsMuted(true);
        if (cmd.type === 'KICK') onLeave();
        if (cmd.type === 'ADMIT') setMyStatus('approved');
        if (cmd.type === 'DENY') onLeave();
      }
    });

    return () => {
      subP.unsubscribe();
      subM.unsubscribe();
      subC.unsubscribe();
    };
  }, [roomName, localParticipantId, onLeave, myStatus]);

  const handleSendMessage = (text: string) => {
    const msg: ChatMessage = { id: crypto.randomUUID(), senderId: localParticipantId, senderName: userName, text, timestamp: Date.now() };
    sendMessageToSupabase(roomName, msg);
  };

  const handleModeration = async (targetId: string, type: 'MUTE' | 'KICK' | 'ADMIT' | 'DENY') => {
    await sendRoomCommand({ room: roomName, targetId, type, issuerId: localParticipantId });
    addToast(`COMMAND_SENT: ${type}`, 'success');
  };

  const { isActive: aiActive, isConnecting: aiConnecting, startSession: startAi, stopSession: stopAi } = useGeminiLive({
    onTranscription: (text, isUser) => {
      const caption = { text, speakerName: isUser ? userName : 'ORBIT_AI', timestamp: Date.now() };
      upsertCaption(roomName, caption);
    }
  });

  if (myStatus === 'waiting' && participants.length > 1) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[200]">
        <div className="w-24 h-24 mb-12 animate-pulse grayscale opacity-50">
           <Logo className="w-full h-full" />
        </div>
        <h2 className="text-2xl font-light text-white uppercase tracking-[0.8em] mb-4">Awaiting Uplink</h2>
        <p className="text-neutral-500 text-[10px] uppercase tracking-[0.4em]">The host must authorize your transmission signal.</p>
        <button onClick={onLeave} className="mt-12 text-neutral-700 hover:text-white transition-colors text-[9px] uppercase tracking-[0.3em]">Abort Session</button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden font-sans">
      <header className="h-16 flex items-center justify-between px-10 bg-black/80 backdrop-blur-3xl z-20 absolute top-0 left-0 right-0 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <span className="text-white text-base font-light tracking-widest uppercase">Orbit RTC</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <span className="text-neutral-500 font-light text-[11px] tracking-[0.3em] uppercase">{roomName}</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
           <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Active_Uplink</span>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        <div className={`flex-1 transition-all duration-700 ease-in-out ${showSidebar ? 'mr-[400px]' : ''}`}>
           <ParticipantGrid participants={participants.filter(p => p.status === 'approved')} localParticipantId={localParticipantId} />
           <CaptionOverlay caption={activeCaption} isVisible={isCaptionsActive} />
        </div>

        <Sidebar 
          isOpen={showSidebar} tab={sidebarTab} onClose={() => setShowSidebar(false)}
          messages={messages} participants={participants} onSendMessage={handleSendMessage}
          roomName={roomName} passcode={passcode} localParticipantId={localParticipantId}
          onModeration={handleModeration}
        />
      </main>

      <ControlDock 
        isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)}
        isVideoOff={isVideoOff} onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        isSharingScreen={isSharingScreen} onToggleScreenShare={() => isSharingScreen ? setIsSharingScreen(false) : setShowScreenShareModal(true)}
        isHandRaised={isHandRaised} onToggleHand={() => setIsHandRaised(!isHandRaised)}
        isCaptionsActive={isCaptionsActive} onToggleCaptions={() => setIsCaptionsActive(!isCaptionsActive)}
        isTranslateActive={isTranslateActive} onToggleTranslate={() => setIsTranslateActive(!isTranslateActive)}
        isRecording={isRecording} onToggleRecording={() => setIsRecording(!isRecording)}
        onReaction={(e) => { setReaction(e); addToast(`EMOTE: ${e}`, 'info'); setTimeout(() => setReaction(undefined), 3000); }}
        onOpenIntegrations={() => {}} onOpenSettings={() => setShowSettings(true)}
        onLeave={onLeave} onToggleSidebar={(tab) => { if (showSidebar && sidebarTab === tab) setShowSidebar(false); else { setShowSidebar(true); setSidebarTab(tab); } }}
        activeSidebarTab={showSidebar ? sidebarTab : null}
        aiActive={aiActive} aiConnecting={aiConnecting} onToggleAi={() => aiActive ? stopAi() : startAi()}
        onTranscribe={() => {}}
      />

      <SettingsPage isOpen={showSettings} onClose={() => setShowSettings(false)} devices={currentDevices} setDevices={setCurrentDevices} role={ParticipantRole.HOST} roomName={roomName} />
      <ScreenShareModal isOpen={showScreenShareModal} onClose={() => setShowScreenShareModal(false)} onConfirm={(a, s) => { setIsSharingScreen(true); setShowScreenShareModal(false); }} />

      <div className="absolute top-24 right-10 z-[60] flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className="bg-black/95 border border-white/10 px-6 py-4 text-[10px] font-normal uppercase tracking-[0.3em] shadow-2xl animate-in slide-in-from-right-10">
             {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
