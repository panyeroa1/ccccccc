
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Participant, ParticipantRole, ChatMessage, DeviceSettings, ToastMessage, ConnectionQuality, LiveCaption, SidebarTab } from '../types';
import ParticipantGrid from './ParticipantGrid';
import ControlDock from './ControlDock';
import Sidebar from './Sidebar';
import SettingsPage from './SettingsPage';
import CaptionOverlay from './CaptionOverlay';
import ScreenShareModal, { DisplaySurface } from './ScreenShareModal';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { transcribeAudio } from '../services/geminiService';
import { fetchMessages, sendMessageToSupabase, subscribeToMessages } from '../services/supabaseService';

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

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [activeCaption, setActiveCaption] = useState<LiveCaption | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isCaptionsActive, setIsCaptionsActive] = useState(false);
  const [isTranslateActive, setIsTranslateActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Persistence Logic: Fetch initial messages and subscribe
  useEffect(() => {
    const initPersistence = async () => {
      const initialMsgs = await fetchMessages(roomName);
      setMessages(initialMsgs);
    };
    initPersistence();

    const subscription = subscribeToMessages(roomName, (newMsg) => {
      setMessages(prev => {
        // Prevent duplicate messages if the local user just sent one
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [roomName]);

  const handleLiveTranscription = useCallback((text: string, isUser: boolean) => {
    setActiveCaption({
      text,
      speakerName: isUser ? userName : 'ORBIT_AI',
      timestamp: Date.now()
    });
  }, [userName]);

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

  useEffect(() => {
    const self: Participant = {
      id: 'local-user',
      name: userName,
      role: ParticipantRole.HOST,
      isMuted,
      isVideoOff,
      isSharingScreen: false,
      isSpeaking: false,
      isHandRaised: false,
      connection: 'good'
    };
    setParticipants([self]);
    addToast(`CONNECTED_${roomName.toUpperCase()}`, 'info');
  }, [userName, roomName, addToast]);

  useEffect(() => {
    setParticipants(prev => prev.map(p => 
      p.id === 'local-user' ? { ...p, isMuted, isVideoOff, isSharingScreen, isHandRaised } : p
    ));
  }, [isMuted, isVideoOff, isSharingScreen, isHandRaised]);

  useEffect(() => {
    if (aiActive) {
      setParticipants(prev => {
        if (prev.some(p => p.role === ParticipantRole.AI)) return prev;
        const ai: Participant = { 
          id: 'gemini-ai', 
          name: 'ORBIT_AI', 
          role: ParticipantRole.AI, 
          isMuted: false, 
          isVideoOff: false, 
          isSharingScreen: false, 
          isSpeaking: false, 
          isHandRaised: false,
          connection: 'good' 
        };
        return [...prev, ai];
      });
    } else {
      setParticipants(prev => prev.filter(p => p.role !== ParticipantRole.AI));
    }
  }, [aiActive]);

  const handleReaction = useCallback((emoji: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === 'local-user' ? { ...p, reaction: emoji } : p
    ));
    setTimeout(() => {
      setParticipants(prev => prev.map(p => 
        p.id === 'local-user' ? { ...p, reaction: undefined } : p
      ));
    }, 3000);
  }, []);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      addToast("ARCHIVE_INITIATED", "success");
    } else {
      setIsRecording(false);
      addToast("ARCHIVE_STORED", "info");
    }
  };

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsSharingScreen(false);
    addToast("UPLINK_TERMINATED", "info");
  }, [addToast]);

  const startScreenShare = async (withAudio: boolean, surface: DisplaySurface) => {
    setIsShareModalOpen(false);
    try {
      const constraints: any = {
        video: { displaySurface: surface, frameRate: 30 },
        audio: withAudio ? { autoGainControl: false, echoCancellation: false, noiseSuppression: false } : false,
        selfBrowserSurface: surface === 'browser' ? 'include' : 'exclude',
        surfaceSwitching: 'include'
      };
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      screenStreamRef.current = stream;
      setIsSharingScreen(true);
      addToast(`STREAMING_${surface.toUpperCase()}`, "success");
      stream.getTracks()[0].onended = () => stopScreenShare();
    } catch (err) {
      if ((err as Error).name !== 'NotAllowedError') {
        addToast("STREAM_ERROR", "error");
      }
      setIsSharingScreen(false);
    }
  };

  const handleSendMessage = (text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: 'local-user',
      senderName: userName,
      text,
      timestamp: Date.now()
    };
    // Optimistic update
    setMessages(prev => [...prev, msg]);
    // Persist to Supabase
    sendMessageToSupabase(roomName, msg);
  };

  const handleTranscription = async (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const text = await transcribeAudio(base64);
      if (text.length > 3) handleSendMessage(`(AUTO): ${text}`);
    };
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
          
          {isRecording && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-sm">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Archiving</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-widest">
             <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
             VOID_PROTOCOL_ACTIVE
           </div>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        <div className={`flex-1 transition-all duration-700 ease-in-out ${showSidebar ? 'mr-[400px]' : ''}`}>
           <ParticipantGrid participants={participants} />
           
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
        onToggleScreenShare={() => {
          if (isSharingScreen) stopScreenShare();
          else setIsShareModalOpen(true);
        }}
        isHandRaised={isHandRaised}
        onToggleHand={() => setIsHandRaised(!isHandRaised)}
        isCaptionsActive={isCaptionsActive}
        onToggleCaptions={() => setIsCaptionsActive(!isCaptionsActive)}
        isTranslateActive={isTranslateActive}
        onToggleTranslate={() => setIsTranslateActive(!isTranslateActive)}
        isRecording={isRecording}
        onToggleRecording={toggleRecording}
        onReaction={handleReaction}
        onOpenIntegrations={() => addToast("INTEGRATIONS_OFFLINE", "info")}
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
        onTranscribe={handleTranscription}
      />

      <SettingsPage 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        devices={currentDevices}
        setDevices={setCurrentDevices}
        role={ParticipantRole.HOST}
        roomName={roomName}
      />

      <ScreenShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onConfirm={startScreenShare}
      />

      <div className="absolute top-24 right-10 z-[60] flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`px-6 py-4 rounded-none border-l-4 backdrop-blur-3xl animate-in slide-in-from-right-10 duration-500 shadow-2xl ${t.type === 'success' ? 'bg-neutral-900 border-white text-white' : t.type === 'error' ? 'bg-red-950/20 border-red-500 text-red-500' : 'bg-black/90 border-neutral-800 text-neutral-400'} text-[10px] font-black uppercase tracking-[0.3em]`}>
             {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
