
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Participant, ParticipantRole, ChatMessage, DeviceSettings, 
  ToastMessage, LiveCaption, SidebarTab, RoomCommand, Meeting 
} from '../types';
import ParticipantGrid from './ParticipantGrid';
import ControlDock from './ControlDock';
import Sidebar from './Sidebar';
import SettingsPage from './SettingsPage';
import CaptionOverlay from './CaptionOverlay';
import ScreenShareModal from './ScreenShareModal';
import Logo from './Logo';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { 
  sendMessageToSupabase, 
  subscribeToMessages, 
  syncParticipant, 
  fetchParticipants, 
  subscribeToParticipants,
  upsertCaption,
  subscribeToCaptions,
  sendRoomCommand,
  subscribeToCommands,
  getOrCreateMeeting,
  upsertProfile
} from '../services/supabaseService';

interface RoomProps {
  userName: string;
  userId: string;
  roomName: string;
  onLeave: () => void;
  devices: DeviceSettings;
}

const Room: React.FC<RoomProps> = ({ userName, userId, roomName, onLeave, devices: initialDevices }) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [showScreenShareModal, setShowScreenShareModal] = useState(false);
  const [currentDevices, setCurrentDevices] = useState<DeviceSettings>(initialDevices);
  
  const [activeCaption, setActiveCaption] = useState<LiveCaption | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isCaptionsActive, setIsCaptionsActive] = useState(false);
  const [isTranslateActive, setIsTranslateActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [myStatus, setMyStatus] = useState<'waiting' | 'approved' | 'denied'>('approved');
  const [reaction, setReaction] = useState<string | undefined>(undefined);

  const participantId = useMemo(() => `${userId.slice(0, 8)}-${roomName}`, [userId, roomName]);

  const addToast = useCallback((text: string, type: 'info' | 'error' | 'success' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Initialize meeting and profile
  useEffect(() => {
    const init = async () => {
      // Step 1: Sync profile
      await upsertProfile({ id: userId, display_name: userName });
      
      // Step 2: Get or create meeting
      const m = await getOrCreateMeeting(roomName, userId);
      if (m) {
        setMeeting(m);
        addToast("UPLINK_STABILIZED", "success");
      } else {
        addToast("FAILED_TO_SYNC_UPLINK", "error");
        setTimeout(onLeave, 3000);
      }
    };
    init();
  }, [roomName, userId, userName]);

  // Sync self to DB
  useEffect(() => {
    if (!meeting) return;

    const heartbeat = setInterval(() => {
      syncParticipant({
        id: participantId,
        user_id: userId,
        meeting_id: meeting.id,
        name: userName,
        role: userId === meeting.host_id ? ParticipantRole.HOST : ParticipantRole.PARTICIPANT,
        status: myStatus as any,
        isMuted,
        isVideoOff,
        isSharingScreen,
        isSpeaking: false,
        isHandRaised,
        reaction
      });
    }, 5000);
    return () => clearInterval(heartbeat);
  }, [meeting, userName, userId, participantId, isMuted, isVideoOff, isSharingScreen, isHandRaised, myStatus, reaction]);

  // Global Listeners
  useEffect(() => {
    if (!meeting) return;

    const refreshParticipants = async () => {
      const roster = await fetchParticipants(meeting.id);
      setParticipants(roster);
      const me = roster.find(p => p.id === participantId);
      if (me && me.status !== myStatus) setMyStatus(me.status as any);
    };

    refreshParticipants();
    const subP = subscribeToParticipants(meeting.id, refreshParticipants);
    const subM = subscribeToMessages(meeting.id, (m) => setMessages(prev => [...prev, m]));
    const subC = subscribeToCommands(meeting.id, (cmd: RoomCommand) => {
      if (cmd.targetId === userId || cmd.targetId === 'all') {
        if (cmd.type === 'MUTE') setIsMuted(true);
        if (cmd.type === 'KICK') onLeave();
        if (cmd.type === 'ADMIT') setMyStatus('approved');
        if (cmd.type === 'DENY') onLeave();
      }
    });
    const subCap = subscribeToCaptions(meeting.id, (caption) => {
      setActiveCaption(caption);
    });

    return () => {
      subP.unsubscribe();
      subM.unsubscribe();
      subC.unsubscribe();
      subCap.unsubscribe();
    };
  }, [meeting, userId, participantId, onLeave, myStatus]);

  const handleSendMessage = (text: string) => {
    if (!meeting) return;
    const msg: ChatMessage = { 
      id: crypto.randomUUID(), 
      meeting_id: meeting.id,
      sender_id: userId, 
      sender_name: userName, 
      text, 
      timestamp: new Date().toISOString() 
    };
    sendMessageToSupabase(meeting.id, msg);
  };

  const handleModeration = async (targetId: string, type: 'MUTE' | 'KICK' | 'ADMIT' | 'DENY') => {
    if (!meeting) return;
    await sendRoomCommand({ room_id: meeting.id, targetId, type, issuerId: userId });
    addToast(`COMMAND_SENT: ${type}`, 'success');
  };

  const { isActive: aiActive, isConnecting: aiConnecting, startSession: startAi, stopSession: stopAi } = useGeminiLive({
    onTranscription: (text, isUser) => {
      if (!meeting) return;
      const caption = { text, speakerName: isUser ? userName : 'ORBIT_AI', timestamp: new Date().toISOString() };
      upsertCaption(meeting.id, caption, userId);
    }
  });

  if (!meeting) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[200]">
        <div className="w-24 h-24 mb-12 animate-pulse grayscale">
           <Logo className="w-full h-full" />
        </div>
        <h2 className="text-xl font-light text-white uppercase tracking-[1em] mb-4">Establishing_Link</h2>
        <div className="h-0.5 w-32 bg-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-white animate-orbit-loading" />
        </div>
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
           <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Session_Sync_OK</span>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        <div className={`flex-1 transition-all duration-700 ease-in-out ${showSidebar ? 'mr-[400px]' : ''}`}>
           <ParticipantGrid participants={participants} localParticipantId={participantId} />
           <CaptionOverlay caption={activeCaption} isVisible={isCaptionsActive} />
        </div>

        <Sidebar 
          isOpen={showSidebar} tab={sidebarTab} onClose={() => setShowSidebar(false)}
          messages={messages} participants={participants} onSendMessage={handleSendMessage}
          roomName={roomName} localParticipantId={participantId}
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

      <SettingsPage isOpen={showSettings} onClose={() => setShowSettings(false)} devices={currentDevices} setDevices={setCurrentDevices} role={meeting.host_id === userId ? ParticipantRole.HOST : ParticipantRole.PARTICIPANT} roomName={roomName} />
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
