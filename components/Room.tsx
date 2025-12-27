
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Participant, ParticipantRole, ChatMessage, DeviceSettings, ToastMessage, ConnectionQuality, LiveCaption, SidebarTab } from '../types';
import ParticipantGrid from './ParticipantGrid';
import ControlDock from './ControlDock';
import Sidebar from './Sidebar';
import SettingsPage from './SettingsPage';
import CaptionOverlay from './CaptionOverlay';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { 
  fetchMessages, 
  sendMessageToSupabase, 
  subscribeToMessages, 
  syncParticipant, 
  fetchParticipants, 
  subscribeToParticipants,
  upsertCaption,
  subscribeToCaptions
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
  const [currentDevices, setCurrentDevices] = useState<DeviceSettings>(initialDevices);
  
  const passcode = useMemo(() => Math.floor(100000 + Math.random() * 900000).toString(), []);
  
  // Consistently identify the local user
  const localParticipantId = useMemo(() => 
    userName.toLowerCase().replace(/\s/g, '-') + '-' + passcode.slice(0,3), 
  [userName, passcode]);

  const [activeCaption, setActiveCaption] = useState<LiveCaption | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isCaptionsActive, setIsCaptionsActive] = useState(false);
  const [isTranslateActive, setIsTranslateActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Persistence Logic: Chat
  useEffect(() => {
    const initChat = async () => {
      const initialMsgs = await fetchMessages(roomName);
      setMessages(initialMsgs);
    };
    initChat();

    const subscription = subscribeToMessages(roomName, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => { subscription.unsubscribe(); };
  }, [roomName]);

  // Persistence Logic: Participants
  useEffect(() => {
    const refreshParticipants = async () => {
      const roster = await fetchParticipants(roomName);
      setParticipants(roster);
    };

    refreshParticipants();
    const subscription = subscribeToParticipants(roomName, refreshParticipants);

    const heartbeat = setInterval(() => {
      const self: Participant = {
        id: localParticipantId,
        name: userName,
        role: ParticipantRole.HOST,
        isMuted,
        isVideoOff,
        isSharingScreen,
        isSpeaking: false,
        isHandRaised,
        connection: 'good'
      };
      syncParticipant(roomName, self);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(heartbeat);
    };
  }, [roomName, userName, localParticipantId, isMuted, isVideoOff, isSharingScreen, isHandRaised]);

  // Persistence Logic: Real-time Live Captions
  useEffect(() => {
    const subscription = subscribeToCaptions(roomName, (caption) => {
      setActiveCaption(caption);
    });
    return () => { subscription.unsubscribe(); };
  }, [roomName]);

  const handleLiveTranscription = useCallback((text: string, isUser: boolean) => {
    const caption: LiveCaption = {
      text,
      speakerName: isUser ? userName : 'ORBIT_AI',
      timestamp: Date.now()
    };
    upsertCaption(roomName, caption);
  }, [userName, roomName]);

  const { isActive: aiActive, isConnecting: aiConnecting, startSession: startAi, stopSession: stopAi } = useGeminiLive({
    onTranscription: handleLiveTranscription
  });

  const addToast = useCallback((text: string, type: 'info' | 'error' | 'success' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const handleSendMessage = (text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: localParticipantId,
      senderName: userName,
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);
    sendMessageToSupabase(roomName, msg);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden font-sans">
      <header className="h-16 flex items-center justify-between px-10 bg-black/80 backdrop-blur-3xl z-20 absolute top-0 left-0 right-0 border-b border-white/5">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { setShowSidebar(true); setSidebarTab('info'); }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/images/logo-only.jpg" alt="Orbit" className="w-full h-full object-contain" />
            </div>
            <span className="text-white text-base font-black tracking-tight uppercase">Orbit</span>
          </button>
          <div className="w-px h-6 bg-white/10" />
          <button 
            onClick={() => { setShowSidebar(true); setSidebarTab('info'); }}
            className="text-neutral-500 hover:text-white transition-colors font-black text-[11px] tracking-[0.3em] uppercase"
          >
            {roomName}
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        <div className={`flex-1 transition-all duration-700 ease-in-out ${showSidebar ? 'mr-[400px]' : ''}`}>
           <ParticipantGrid 
             participants={participants} 
             localParticipantId={localParticipantId}
           />
           
           <CaptionOverlay 
             caption={activeCaption} 
             isVisible={isCaptionsActive} 
           />
        </div>

        <Sidebar 
          isOpen={showSidebar} 
          tab={sidebarTab} 
          onClose={() => setShowSidebar(false)}
          messages={messages}
          participants={participants}
          onSendMessage={handleSendMessage}
          roomName={roomName}
          passcode={passcode}
          onCopyInvite={() => addToast("INVITE_COPIED", "success")}
        />
      </main>

      <ControlDock 
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        isVideoOff={isVideoOff}
        onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        isSharingScreen={isSharingScreen}
        onToggleScreenShare={() => {}}
        isHandRaised={isHandRaised}
        onToggleHand={() => setIsHandRaised(!isHandRaised)}
        isCaptionsActive={isCaptionsActive}
        onToggleCaptions={() => setIsCaptionsActive(!isCaptionsActive)}
        isTranslateActive={isTranslateActive}
        onToggleTranslate={() => setIsTranslateActive(!isTranslateActive)}
        isRecording={isRecording}
        onToggleRecording={() => setIsRecording(!isRecording)}
        onReaction={() => {}}
        onOpenIntegrations={() => {}}
        onOpenSettings={() => setShowSettings(true)}
        onLeave={onLeave}
        onToggleSidebar={(tab) => {
          if (showSidebar && sidebarTab === tab) setShowSidebar(false);
          else { setShowSidebar(true); setSidebarTab(tab); }
        }}
        activeSidebarTab={showSidebar ? sidebarTab : null}
        aiActive={aiActive}
        aiConnecting={aiConnecting}
        onToggleAi={() => aiActive ? stopAi() : startAi()}
        onTranscribe={() => {}}
      />

      <SettingsPage 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        devices={currentDevices}
        setDevices={setCurrentDevices}
        role={ParticipantRole.HOST}
        roomName={roomName}
      />

      <div className="absolute top-24 right-10 z-[60] flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className="bg-black/90 border border-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em]">
             {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
