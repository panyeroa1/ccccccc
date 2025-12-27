
import React, { useEffect, useRef, useState } from 'react';
import { DeviceSettings } from '../types';
import Logo from './Logo';

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
          video: { deviceId: devices.videoInputId }, 
          audio: { deviceId: devices.audioInputId } 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        const devs = await navigator.mediaDevices.enumerateDevices();
        setAvailableDevices(devs);
      } catch (err) {
        console.error("Hardware access denied", err);
      }
    };
    initPreview();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [devices.videoInputId, devices.audioInputId]);

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
    <div className="flex flex-col lg:flex-row items-stretch w-full h-full bg-black overflow-hidden font-roboto">
      {/* Left: Huge Preview with Cinematic Filters */}
      <div className="flex-1 relative bg-neutral-950 flex items-center justify-center border-r border-white/5 overflow-hidden">
        {isVideoOff ? (
          <div className="flex flex-col items-center gap-8">
             <div className="w-64 h-64 bg-neutral-900 border border-white/5 flex items-center justify-center text-8xl font-thin text-white">
                {userName ? userName.charAt(0).toUpperCase() : '?'}
             </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className={`w-full h-full object-cover transition-all duration-1000 ${devices.isMirrored ? 'scale-x-[-1]' : ''}`}
              style={{
                filter: devices.isBeautified ? 'contrast(1.05) brightness(1.02) saturate(0.95) blur(0.2px)' : 'none'
              }}
            />
            {devices.backgroundEffect === 'blur' && (
              <div className="absolute inset-0 backdrop-blur-xl pointer-events-none opacity-40 bg-black/10" />
            )}
          </div>
        )}
        
        <div className="absolute top-12 left-12">
           <Logo className="w-12 h-12" />
        </div>

        {/* Cinematic Control Bar */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/90 backdrop-blur-3xl px-10 py-5 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <ControlButton active={!isMuted} danger={isMuted} onClick={toggleAudio} icon={<MicIcon muted={isMuted} />} />
          <ControlButton active={!isVideoOff} danger={isVideoOff} onClick={toggleVideo} icon={<VideoIcon off={isVideoOff} />} />
          <div className="w-px h-8 bg-white/10 mx-2" />
          <EffectToggle label="Mirror" active={devices.isMirrored} onClick={() => setDevices({...devices, isMirrored: !devices.isMirrored})} />
          <EffectToggle label="Beautify" active={devices.isBeautified} onClick={() => setDevices({...devices, isBeautified: !devices.isBeautified})} />
          <select 
            className="bg-neutral-800 text-[9px] uppercase tracking-widest px-4 py-2 text-white outline-none border border-white/5"
            value={devices.backgroundEffect}
            onChange={(e) => setDevices({...devices, backgroundEffect: e.target.value as any})}
          >
            <option value="none">BG: NAKED</option>
            <option value="blur">BG: BLURRED</option>
            <option value="orbit">BG: VOID</option>
          </select>
        </div>
      </div>

      {/* Right: Join Sidebar */}
      <div className="w-full lg:w-[550px] flex flex-col p-20 space-y-12 bg-black z-10 animate-in slide-in-from-right-20">
        <div className="space-y-4">
          <h2 className="text-6xl font-thin text-white tracking-tight uppercase leading-none">Identity</h2>
          <p className="text-neutral-500 text-[10px] font-normal uppercase tracking-[0.6em]">Preparing for <span className="text-white">{roomName}</span></p>
        </div>

        <div className="space-y-12">
          <div className="space-y-4">
            <label className="text-[10px] font-normal text-neutral-600 uppercase tracking-[0.3em]">DisplayName_Signature</label>
            <input 
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="ENTER_SIGNATURE"
              className="w-full bg-transparent border-b border-white/10 py-5 text-3xl text-white outline-none focus:border-white transition-all font-light"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-normal text-neutral-600 uppercase tracking-[0.3em]">Hardware_Routing</label>
            <div className="grid grid-cols-1 gap-4">
              <select className="bg-neutral-900 border border-white/5 p-4 text-[10px] text-white uppercase tracking-widest outline-none focus:border-white">
                {availableDevices.filter(d => d.kind === 'videoinput').map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'CAM_UNIT'}</option>)}
              </select>
              <select className="bg-neutral-900 border border-white/5 p-4 text-[10px] text-white uppercase tracking-widest outline-none focus:border-white">
                {availableDevices.filter(d => d.kind === 'audioinput').map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'AUDIO_FEED'}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-12">
          <button 
            onClick={onJoin}
            disabled={!userName.trim()}
            className="w-full py-8 bg-white hover:bg-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-700 text-black text-xs font-normal uppercase tracking-[0.6em] transition-all shadow-[0_0_40px_rgba(255,255,255,0.05)] active:scale-[0.98]"
          >
            Enter Orbit
          </button>
          <button onClick={onCancel} className="w-full py-4 text-neutral-600 hover:text-white transition-all text-[9px] uppercase tracking-widest">Abort_Launch</button>
        </div>
      </div>
    </div>
  );
};

const ControlButton = ({ active, danger, onClick, icon }: any) => (
  <button onClick={onClick} className={`p-4 transition-all active:scale-90 ${danger ? 'bg-red-600 text-white' : active ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-500 hover:text-white'}`}>
    {icon}
  </button>
);

const EffectToggle = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`text-[9px] uppercase tracking-widest px-4 py-2 border transition-all ${active ? 'bg-white text-black border-white' : 'text-neutral-500 border-white/10 hover:border-white/20'}`}>
    {label}
  </button>
);

const MicIcon = ({ muted }: any) => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={muted ? "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" : "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v1a7 7 0 01-14 0v-1m14 0a7 7 0 01-7 7m0 0a7 7 0 01-7-7"} /></svg>;
const VideoIcon = ({ off }: any) => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={off ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"} /></svg>;

export default Lobby;
