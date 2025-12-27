
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
  subscribeToSignals,
  ensureAuth
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

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

  const addToast = useCallback((text: string, type: 'info' | 'error' | 'success' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Secure Initialization
  useEffect(() => {
    const init = async () => {
      await ensureAuth();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: currentDevices.videoInputId },
          audio: { deviceId: currentDevices.audioInputId }
        });
        setLocalStream(stream);
        addToast("Orbit Uplink Initialized", "success");
      } catch (err) {
        addToast("Signal Blocked: Check Hardware", "error");
      }
    };
    init();
    return () => localStream?.getTracks().forEach(t => t.stop());
  }, []);

  // Local Controls Sync
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
      localStream.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
    }
  }, [isMuted, isVideoOff, localStream]);

  // Fix: Initialize Gemini Live for AI assistance and transcription
  const { isActive: aiActive, isConnecting: aiConnecting, startSession, stopSession } = useGeminiLive({ 
    onTranscription: (text, isUser) => {
      const caption: LiveCaption = {
        text,
        speakerName: isUser ? userName : 'Orbit AI',
        timestamp: Date.now()
      };
      setActiveCaption(caption);
      // If captions are globally enabled, sync to Supabase for other participants
      if (isCaptionsActive) {
        upsertCaption(roomName, caption);
      }
    }
  });

  // WebRTC Mesh
  const createPeer = useCallback(async (targetId: string, shouldOffer: boolean) => {
    if (peerConnections.current[targetId]) return peerConnections.current[targetId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
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

  // Sync Logic
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
        isMirrored: currentDevices.isMirrored,
        isBeautified: currentDevices.isBeautified
      });
    }, 4000);
    return () => clearInterval(heartbeat);
  }, [roomName, userName, localId, isMuted, isVideoOff, isSharingScreen, isHandRaised, myStatus, participants.length, currentDevices]);

  useEffect(() => {
    const refreshParticipants = async () => {
      const roster = await fetchParticipants(roomName);
      setParticipants(roster);
      const me = roster.find(p => p.id === localId);
      if (me && me.status !== myStatus) setMyStatus(me.status);

      // Notify Host of waiting participants
      if (participants[0]?.id === localId && roster.some(p => p.status === 'waiting')) {
        addToast("Identity awaiting admission.", "info");
      }

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
    // Fix: Subscribe to remote captions
    const subCaptions = subscribeToCaptions(roomName, (cap) => {
      setActiveCaption(cap);
    });

    return () => {
      subP.unsubscribe();
      subM.unsubscribe();
      subC.unsubscribe();
      subCaptions.unsubscribe();
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, [roomName, localId, onLeave, createPeer]);

  // Features: Recording
  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      addToast("Archived Session Successfully", "success");
    } else {
      if (!localStream) return;
      recordedChunks.current = [];
      const recorder = new MediaRecorder(localStream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Orbit_Session_${roomName}.webm`;
        a.click();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      addToast("Session Recording Initiated", "info");
    }
  };

  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const videoTrack = displayStream.getVideoTracks()[0];
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });
      videoTrack.onended = () => {
        setIsSharingScreen(false);
        window.location.reload();
      };
      setLocalStream(displayStream);
      setIsSharingScreen(true);
      setShowScreenShareModal(false);
    } catch (err) {
      addToast("Broadcast Aborted", "error");
    }
  };

  if (myStatus === 'waiting' && participants.length > 1) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[200]">
        <Logo className="w-24 h-24 mb-12 animate-pulse" />
        <h2 className="text-3xl font-thin text-white uppercase tracking-[1em] mb-4">Void Gateway</h2>
        <p className="text-neutral-500 text-[10px] uppercase tracking-[0.5em] mb-12 animate-pulse">Awaiting host clearance...</p>
        <button onClick={onLeave} className="px-10 py-4 border border-white/10 text-white text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Abort_Signal</button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden font-roboto">
      <header className="h-20 flex items-center justify-between px-12 bg-black/80 backdrop-blur-3xl z-20 absolute top-0 left-0 right-0 border-b border-white/5">
        <div className="flex items-center gap-8">
          <Logo className="w-10 h-10" />
          <div className="flex flex-col">
            <span className="text-white text-lg font-thin tracking-widest uppercase leading-none">Orbit RTC</span>
            <span className="text-neutral-700 text-[8px] uppercase tracking-widest mt-1">Uplink_Active: {roomName}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
             <span className="text-white text-[10px] uppercase tracking-widest leading-none">Encrypted_Transport</span>
             <span className="text-green-500 text-[8px] uppercase tracking-tighter mt-1 animate-pulse">Status: Pure</span>
           </div>
           <div className="w-10 h-10 border border-white/5 flex items-center justify-center group cursor-pointer hover:border-white transition-all">
              <svg className="w-5 h-5 text-white opacity-20 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth={1} /></svg>
           </div>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        <div className={`flex-1 transition-all duration-1000 ease-in-out ${showSidebar ? 'mr-[400px]' : ''}`}>
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
          messages={messages} participants={participants} onSendMessage={(t) => sendMessageToSupabase(roomName, { id: crypto.randomUUID(), senderId: localId, senderName: userName, text: t, timestamp: Date.now() })}
          roomName={roomName} passcode={passcode} localParticipantId={localId}
          onModeration={(targetId, type) => sendRoomCommand({ room: roomName, targetId, type, issuerId: localId })}
        />
      </main>

      <ControlDock 
        isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)}
        isVideoOff={isVideoOff} onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        isSharingScreen={isSharingScreen} onToggleScreenShare={() => isSharingScreen ? window.location.reload() : setShowScreenShareModal(true)}
        isHandRaised={isHandRaised} onToggleHand={() => { setIsHandRaised(!isHandRaised); sendRoomCommand({ room: roomName, targetId: 'all', type: 'RAISE_HAND', issuerId: localId }); }}
        isCaptionsActive={isCaptionsActive} onToggleCaptions={() => setIsCaptionsActive(!isCaptionsActive)}
        isTranslateActive={isTranslateActive} onToggleTranslate={() => setIsTranslateActive(!isTranslateActive)}
        isRecording={isRecording} onToggleRecording={toggleRecording}
        onReaction={(e) => { addToast(`Uplink_React: ${e}`, 'info'); }}
        onOpenIntegrations={() => {}} onOpenSettings={() => setShowSettings(true)}
        onLeave={onLeave} onToggleSidebar={(tab) => { if (showSidebar && sidebarTab === tab) setShowSidebar(false); else { setShowSidebar(true); setSidebarTab(tab); } }}
        activeSidebarTab={showSidebar ? sidebarTab : null}
        aiActive={aiActive} aiConnecting={aiConnecting} onToggleAi={() => aiActive ? stopSession() : startSession()}
        onTranscribe={() => {}}
      />

      <SettingsPage isOpen={showSettings} onClose={() => setShowSettings(false)} devices={currentDevices} setDevices={setCurrentDevices} role={participants[0]?.id === localId ? ParticipantRole.HOST : ParticipantRole.PARTICIPANT} roomName={roomName} />
      <ScreenShareModal isOpen={showScreenShareModal} onClose={() => setShowScreenShareModal(false)} onConfirm={() => startScreenShare()} />

      <div className="absolute top-24 right-12 z-[60] flex flex-col gap-4">
        {toasts.map(t => (
          <div key={t.id} className="bg-white text-black px-10 py-5 text-[10px] font-normal uppercase tracking-[0.4em] shadow-[0_30px_60px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-20">
             {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
