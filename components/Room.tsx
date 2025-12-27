
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Participant, ParticipantRole, ChatMessage, DeviceSettings, ToastMessage, ConnectionQuality, LiveCaption } from '../types';
import ParticipantGrid from './ParticipantGrid';
import ControlDock from './ControlDock';
import Sidebar from './Sidebar';
import SettingsPage from './SettingsPage';
import CaptionOverlay from './CaptionOverlay';
import ScreenShareModal from './ScreenShareModal';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { transcribeAudio } from '../services/geminiService';

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
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants'>('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [currentDevices, setCurrentDevices] = useState<DeviceSettings>(initialDevices);
  
  // Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Stream refs
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Captions state
  const [activeCaption, setActiveCaption] = useState<LiveCaption | null>(null);

  // New States for enhanced Control Dock
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isCaptionsActive, setIsCaptionsActive] = useState(false);
  const [isTranslateActive, setIsTranslateActive] = useState(false);

  const handleLiveTranscription = useCallback((text: string, isUser: boolean) => {
    setActiveCaption({
      text,
      speakerName: isUser ? userName : 'Orbit Assistant',
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
    addToast(`You joined ${roomName}`, 'info');
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
          name: 'Orbit Assistant', 
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

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsSharingScreen(false);
    addToast("Screen sharing stopped", "info");
  }, [addToast]);

  const startScreenShare = async (withAudio: boolean) => {
    setIsShareModalOpen(false);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: withAudio
      });
      
      screenStreamRef.current = stream;
      setIsSharingScreen(true);
      addToast("You are now sharing your screen", "success");

      // Handle user stopping share via browser UI
      stream.getTracks()[0].onended = () => {
        stopScreenShare();
      };

    } catch (err) {
      console.error("Failed to start screen share:", err);
      addToast("Screen share cancelled", "info");
      setIsSharingScreen(false);
    }
  };

  useEffect(() => {
    return () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleSendMessage = (text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'local-user',
      senderName: userName,
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);
  };

  const handleTranscription = async (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const text = await transcribeAudio(base64);
      if (text.length > 3) handleSendMessage(`(Auto-Caption): ${text}`);
    };
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden font-sans">
      <header className="h-14 flex items-center justify-between px-6 bg-gradient-to-b from-black/80 to-transparent z-20 absolute top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-sm bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-white text-sm font-bold tracking-tight uppercase">Orbit</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-white/70 font-medium text-xs tracking-tight">{roomName}</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-white/5 rounded text-[10px] font-bold text-neutral-400">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
             E2E ENCRYPTED
           </div>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        <div className={`flex-1 transition-all duration-500 ease-in-out ${showSidebar ? 'mr-[380px]' : ''}`}>
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
        onToggleCaptions={() => {
          setIsCaptionsActive(!isCaptionsActive);
          addToast(isCaptionsActive ? "Captions Disabled" : "Captions Enabled", "info");
        }}
        isTranslateActive={isTranslateActive}
        onToggleTranslate={() => {
          setIsTranslateActive(!isTranslateActive);
          addToast(isTranslateActive ? "Translation Stopped" : "Live Translation Active", "success");
        }}
        onOpenIntegrations={() => addToast("Integrations coming soon", "info")}
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

      <div className="absolute top-20 right-6 z-[60] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2.5 rounded border backdrop-blur-md animate-in slide-in-from-right-4 duration-300 shadow-xl ${t.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : t.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-neutral-900/90 border-white/5 text-white'} text-[11px] font-bold uppercase tracking-wider`}>
             {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
