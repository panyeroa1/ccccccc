
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
    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-6xl p-6 h-full overflow-hidden bg-[#0a0a0a]">
      {/* Left: Preview Panel */}
      <div className="flex-1 w-full max-w-2xl space-y-4">
        <div className="relative aspect-video bg-[#111] rounded-lg overflow-hidden border border-white/5 shadow-2xl">
          {isVideoOff ? (
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-32 h-32 bg-neutral-800 rounded-full flex items-center justify-center text-5xl font-light text-neutral-500 border border-white/5">
                  {userName ? userName.charAt(0).toUpperCase() : '?'}
               </div>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover" 
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-3 rounded-full border border-white/10">
            <button 
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button 
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Join Form */}
      <div className="w-full lg:w-[400px] flex flex-col space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">Meeting Ready</h2>
          <p className="text-neutral-500 text-sm font-medium">Join <span className="text-blue-500">{roomName}</span> as:</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Your Display Name</label>
            <input 
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="E.g. John Doe"
              className="w-full bg-[#1e1e1e] border border-white/5 rounded-lg p-4 text-sm text-white outline-none focus:ring-1 focus:ring-blue-600 transition-all"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Camera</label>
              <select 
                className="w-full bg-[#1e1e1e] border border-white/5 rounded-lg p-3 text-[11px] text-white appearance-none outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                value={devices.videoInputId}
                onChange={(e) => setDevices(prev => ({...prev, videoInputId: e.target.value}))}
              >
                {availableDevices.filter(d => d.kind === 'videoinput').map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Microphone</label>
              <select 
                className="w-full bg-[#1e1e1e] border border-white/5 rounded-lg p-3 text-[11px] text-white appearance-none outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                value={devices.audioInputId}
                onChange={(e) => setDevices(prev => ({...prev, audioInputId: e.target.value}))}
              >
                {availableDevices.filter(d => d.kind === 'audioinput').map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 5)}`}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={onJoin}
            disabled={!userName.trim()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-bold rounded-lg transition-all shadow-xl shadow-blue-600/10 active:scale-[0.99]"
          >
            Join Meeting
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-semibold rounded-lg border border-white/5 transition-all text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
