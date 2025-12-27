
import React, { useEffect, useRef, useState } from 'react';
import { DeviceSettings } from '../types';

interface LobbyProps {
  userName: string;
  setUserName: (name: string) => void;
  roomName: string;
  onJoin: () => void;
  onCancel: () => void;
  devices: DeviceSettings;
  setDevices: React.Dispatch<React.SetStateAction<DeviceSettings>>;
}

const Lobby: React.FC<LobbyProps> = ({ userName, setUserName, roomName, onJoin, onCancel, devices, setDevices }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    const initPreview = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        
        const devs = await navigator.mediaDevices.enumerateDevices();
        setAvailableDevices(devs);
      } catch (err) {
        console.error("Permission denied", err);
      }
    };
    initPreview();

    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch w-full h-full bg-black overflow-hidden">
      {/* Left: Huge Preview */}
      <div className="flex-1 relative bg-neutral-950 flex items-center justify-center border-r border-white/5">
        {isVideoOff ? (
          <div className="flex flex-col items-center gap-8">
             <div className="w-64 h-64 bg-neutral-900 border border-white/5 flex items-center justify-center text-8xl font-black text-white">
                {userName ? userName.charAt(0).toUpperCase() : '?'}
             </div>
             <span className="text-xs font-black uppercase tracking-[0.5em] text-neutral-600 animate-pulse">Video Disabled</span>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-80" 
            style={{ transform: 'scaleX(-1)' }}
          />
        )}
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-3xl px-8 py-4 border border-white/10">
          <button 
            onClick={toggleAudio}
            className={`p-4 transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-white text-black hover:bg-neutral-200'}`}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
          <button 
            onClick={toggleVideo}
            className={`p-4 transition-all ${isVideoOff ? 'bg-red-600 text-white' : 'bg-white text-black hover:bg-neutral-200'}`}
          >
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </div>

      {/* Right: Join Sidebar */}
      <div className="w-full lg:w-[500px] flex flex-col p-16 space-y-12 animate-in slide-in-from-right-10 duration-700 bg-black">
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Ready for orbit.</h2>
          <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.4em]">Joining <span className="text-white">{roomName}</span></p>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Identity Signature</label>
            <input 
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="ENTER_NAME"
              className="w-full bg-transparent border-b border-white/10 py-4 text-2xl text-white outline-none focus:border-white transition-all font-black tracking-tight"
              required
              autoFocus
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Optic Source</label>
              <select 
                className="w-full bg-neutral-900 border border-white/5 py-4 px-4 text-[10px] font-black text-white appearance-none outline-none focus:border-white cursor-pointer uppercase tracking-widest"
                value={devices.videoInputId}
                onChange={(e) => setDevices(prev => ({...prev, videoInputId: e.target.value}))}
              >
                {availableDevices.filter(d => d.kind === 'videoinput').map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `OPTIC_${d.deviceId.slice(0, 5)}`}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Audio Feed</label>
              <select 
                className="w-full bg-neutral-900 border border-white/5 py-4 px-4 text-[10px] font-black text-white appearance-none outline-none focus:border-white cursor-pointer uppercase tracking-widest"
                value={devices.audioInputId}
                onChange={(e) => setDevices(prev => ({...prev, audioInputId: e.target.value}))}
              >
                {availableDevices.filter(d => d.kind === 'audioinput').map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `AUDIO_${d.deviceId.slice(0, 5)}`}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-10">
          <button 
            onClick={onJoin}
            disabled={!userName.trim()}
            className="w-full py-6 bg-white hover:bg-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-700 text-black text-xs font-black uppercase tracking-[0.5em] transition-all shadow-xl active:scale-[0.99]"
          >
            Launch Session
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-4 bg-transparent hover:bg-white/5 text-neutral-600 hover:text-white font-black uppercase tracking-[0.3em] transition-all text-[10px]"
          >
            Abort
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
