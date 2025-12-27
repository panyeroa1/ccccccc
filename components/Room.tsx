
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Participant, ParticipantRole, ChatMessage, DeviceSettings, ToastMessage, LiveCaption, SidebarTab, RoomCommand } from '../types';
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
  sendSignal,
  subscribeToSignals
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
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});

  const passcode = useMemo(() => Math.floor(100000 + Math.random() * 900000).toString(), []);
  const localId = useMemo(() => `${userName.toLowerCase().replace(/\s/g, '-')}-${passcode.slice(0,3)}`, [userName, passcode]);

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

  // Media Management
  useEffect(() => {
    const initLocalMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: currentDevices.videoInputId },
          audio: { deviceId: currentDevices.audioInputId }
        });
        setLocalStream(stream);
        addToast("Media initialized", "success");
      } catch (err) {
        addToast("Hardware access denied", "error");
      }
    };
    initLocalMedia();
    return () => localStream?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
      localStream.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
    }
  }, [isMuted, isVideoOff, localStream]);

  // WebRTC Signaling Engine
  const createPeer = useCallback(async (targetId: string, shouldOffer: boolean) => {
    if (peerConnections.current[targetId]) return peerConnections.current[targetId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(roomName, targetId, localId, { type: 'ice', candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({ ...prev, [targetId]: event.streams[0] }));
    };

    localStream?.getTracks().forEach(track => pc.addTrack(track, localStream));

    if (shouldOffer) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal(roomName, targetId, localId, { type: 'sdp', sdp: offer });
    }

    peerConnections.current[targetId] = pc;
    return pc;
  }, [localStream, localId, roomName]);

  useEffect(() => {
    const subSignals = subscribeToSignals(roomName, localId, async (senderId, signal) => {
      let pc = peerConnections.current[senderId];
      if (!pc) pc = await createPeer(senderId, false);

      if (signal.type === 'sdp') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        if (signal.sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(roomName, senderId, localId, { type: 'sdp', sdp: answer });
        }
      } else if (signal.type === 'ice') {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });

    return () => subSignals.unsubscribe();
  }, [roomName, localId, createPeer]);

  // Heartbeat & Roster
  useEffect(() => {
    const heartbeat = setInterval(() => {
      syncParticipant(roomName, {
        id: localId,
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
  }, [roomName, userName, localId, isMuted, isVideoOff, isSharingScreen, isHandRaised, myStatus, reaction, participants.length]);

  useEffect(() => {
    const refreshParticipants = async () => {
      const roster = await fetchParticipants(roomName);
      setParticipants(roster);
      const me = roster.find(p => p.id === localId);
      if (me && me.status !== myStatus) setMyStatus(me.status);

      // Discovery: Join any approved participant that we aren't connected to
      roster.forEach(p => {
        if (p.id !== localId && p.status === 'approved' && !peerConnections.current[p.id]) {
          createPeer(p.id, true);
        }
      });
    };

    refreshParticipants();
    const subP = subscribeToParticipants(roomName, refreshParticipants);
    const subM = subscribeToMessages(roomName, (m) => setMessages(prev => [...prev, m]));
    const subC = subscribeToCommands(roomName, (cmd: RoomCommand) => {
      if (cmd.targetId === localId || cmd.targetId === 'all') {
        if (cmd.type === 'MUTE') setIsMuted(true);
        if (cmd.type === 'KICK') onLeave();
        if (cmd.type === 'ADMIT') setMyStatus('approved');
      }
    });

    return () => {
      subP.unsubscribe();
      subM.unsubscribe();
      subC.unsubscribe();
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, [roomName, localId, onLeave, createPeer]);

  const handleSendMessage = (text: string) => {
    const msg: ChatMessage = { id: crypto.randomUUID(), senderId: localId, senderName: userName, text, timestamp: Date.now() };
    sendMessageToSupabase(roomName, msg);
  };

  const handleToggleScreenShare = async () => {
    if (isSharingScreen) {
      // Revert to camera
      setIsSharingScreen(false);
      addToast("Screen sharing stopped", "info");
      window.location.reload(); // Simplest way to reset mesh tracks for this MVP
    } else {
      setShowScreenShareModal(true);
    }
  };

  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const videoTrack = displayStream.getVideoTracks()[0];
      
      // Replace video track in all peer connections
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });

      videoTrack.onended = () => handleToggleScreenShare();
      setLocalStream(displayStream);
      setIsSharingScreen(true);
      setShowScreenShareModal(false);
    } catch (err) {
      addToast("Sharing aborted", "error");
    }
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
        <Logo className="w-24 h-24 mb-12 animate-pulse" />
        <h2 className="text-2xl font-light text-white uppercase tracking-[0.8em] mb-4">Awaiting Uplink</h2>
        <button onClick={onLeave} className="mt-12 text-neutral-700 hover:text-white transition-colors text-[9px] uppercase tracking-[0.3em]">Abort Session</button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden font-sans">
      <header className="h-16 flex items-center justify-between px-10 bg-black/80 backdrop-blur-3xl z-20 absolute top-0 left-0 right-0 border-b border-white/5">
        <div className="flex items-center gap-6">
          <Logo className="w-8 h-8" />
          <span className="text-white text-base font-light tracking-widest uppercase">Orbit RTC</span>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        <div className={`flex-1 transition-all duration-700 ease-in-out ${showSidebar ? 'mr-[400px]' : ''}`}>
           <ParticipantGrid 
              participants={participants.filter(p => p.status === 'approved')} 
              localParticipantId={localId}
              localStream={localStream}
              remoteStreams={remoteStreams}
           />
           <CaptionOverlay caption={activeCaption} isVisible={isCaptionsActive} />
        </div>

        <Sidebar 
          isOpen={showSidebar} tab={sidebarTab} onClose={() => setShowSidebar(false)}
          messages={messages} participants={participants} onSendMessage={handleSendMessage}
          roomName={roomName} passcode={passcode} localParticipantId={localId}
          onModeration={(targetId, type) => sendRoomCommand({ room: roomName, targetId, type, issuerId: localId })}
        />
      </main>

      <ControlDock 
        isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)}
        isVideoOff={isVideoOff} onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        isSharingScreen={isSharingScreen} onToggleScreenShare={handleToggleScreenShare}
        isHandRaised={isHandRaised} onToggleHand={() => setIsHandRaised(!isHandRaised)}
        isCaptionsActive={isCaptionsActive} onToggleCaptions={() => setIsCaptionsActive(!isCaptionsActive)}
        isTranslateActive={isTranslateActive} onToggleTranslate={() => setIsTranslateActive(!isTranslateActive)}
        isRecording={isRecording} onToggleRecording={() => setIsRecording(!isRecording)}
        onReaction={(e) => setReaction(e)}
        onOpenIntegrations={() => {}} onOpenSettings={() => setShowSettings(true)}
        onLeave={onLeave} onToggleSidebar={(tab) => { if (showSidebar && sidebarTab === tab) setShowSidebar(false); else { setShowSidebar(true); setSidebarTab(tab); } }}
        activeSidebarTab={showSidebar ? sidebarTab : null}
        aiActive={aiActive} aiConnecting={aiConnecting} onToggleAi={() => aiActive ? stopAi() : startAi()}
        onTranscribe={() => {}}
      />

      <SettingsPage isOpen={showSettings} onClose={() => setShowSettings(false)} devices={currentDevices} setDevices={setCurrentDevices} role={ParticipantRole.HOST} roomName={roomName} />
      <ScreenShareModal isOpen={showScreenShareModal} onClose={() => setShowScreenShareModal(false)} onConfirm={() => startScreenShare()} />

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
