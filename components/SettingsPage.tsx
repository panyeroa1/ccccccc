
import React, { useState, useEffect } from 'react';
import { DeviceSettings, ParticipantRole } from '../types';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceSettings;
  setDevices: (d: DeviceSettings) => void;
  role: ParticipantRole;
  roomName: string;
}

type SettingsTab = 'devices' | 'video' | 'audio' | 'security' | 'notifications' | 'shortcuts';

const SettingsPage: React.FC<SettingsPageProps> = ({ isOpen, onClose, devices, setDevices, role, roomName }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('devices');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  
  const [videoQuality, setVideoQuality] = useState('720p');
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGain, setAutoGain] = useState(false);

  // Notification Settings
  const [notifJoinSound, setNotifJoinSound] = useState(true);
  const [notifJoinVisual, setNotifJoinVisual] = useState(true);
  const [notifLeaveSound, setNotifLeaveSound] = useState(false);
  const [notifLeaveVisual, setNotifLeaveVisual] = useState(true);
  const [notifChatSound, setNotifChatSound] = useState(true);
  const [notifChatVisual, setNotifChatVisual] = useState(true);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        setAvailableDevices(devs);
      } catch (err) {
        console.error("Could not load devices", err);
      }
    };
    if (isOpen) getDevices();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex bg-black animate-in slide-in-from-right-full duration-700 font-sans">
      <div className="w-96 bg-neutral-950 border-r border-white/5 flex flex-col p-12">
        <div className="flex items-center gap-6 mb-20">
          <div className="w-12 h-12 bg-white flex items-center justify-center">
            <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-light uppercase tracking-[0.3em] text-white leading-none">Settings</span>
            <span className="text-[9px] text-neutral-700 font-normal uppercase tracking-[0.4em] mt-2">{roomName}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          <TabButton active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} label="Peripherals" icon={<DeviceIcon />} />
          <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} label="Optics" icon={<VideoIcon />} />
          <TabButton active={activeTab === 'audio'} onClick={() => setActiveTab('audio')} label="Filters" icon={<AudioIcon />} />
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} label="Privacy" icon={<SecurityIcon />} />
          <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} label="Alerts" icon={<BellIcon />} />
          <TabButton active={activeTab === 'shortcuts'} onClick={() => setActiveTab('shortcuts')} label="Binding" icon={<ShortcutIcon />} />
        </nav>

        <button 
          onClick={onClose}
          className="mt-auto flex items-center justify-between p-6 bg-white text-black font-normal uppercase tracking-[0.4em] text-[10px] active:scale-95 transition-all"
        >
          <span>Return</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-black p-24">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'devices' && (
            <Section title="Peripheral Config" subtitle="Initialize hardware interfaces for the current session.">
              <div className="grid grid-cols-1 gap-12">
                <DeviceSelector label="Optic_Stream" value={devices.videoInputId} options={availableDevices.filter(d => d.kind === 'videoinput')} onChange={(val) => setDevices({...devices, videoInputId: val})} />
                <DeviceSelector label="Audio_Uplink" value={devices.audioInputId} options={availableDevices.filter(d => d.kind === 'audioinput')} onChange={(val) => setDevices({...devices, audioInputId: val})} />
                <DeviceSelector label="Audio_Downlink" value={devices.audioOutputId} options={availableDevices.filter(d => d.kind === 'audiooutput')} onChange={(val) => setDevices({...devices, audioOutputId: val})} />
              </div>
            </Section>
          )}

          {activeTab === 'video' && (
            <Section title="Optic Res" subtitle="Scale resolution to balance bandwidth against clarity.">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <QualityOption label="720p_HIGH" active={videoQuality === '720p'} onClick={() => setVideoQuality('720p')} />
                  <QualityOption label="360p_LOW" active={videoQuality === '360p'} onClick={() => setVideoQuality('360p')} />
                  <QualityOption label="NULL_VIDEO" active={videoQuality === 'audio-only'} onClick={() => setVideoQuality('audio-only')} />
                  <QualityOption label="ADAPTIVE" active={videoQuality === 'auto'} onClick={() => setVideoQuality('auto')} />
               </div>
            </Section>
          )}

          {activeTab === 'audio' && (
            <Section title="Processing" subtitle="Signal conditioning for optimal audio fidelity.">
               <div className="space-y-6">
                  <SecurityToggle label="NOISE_SUPPRESSION" active={noiseSuppression} onChange={() => setNoiseSuppression(!noiseSuppression)} disabled={false} />
                  <SecurityToggle label="ECHO_CANCELLATION" active={echoCancellation} onChange={() => setEchoCancellation(!echoCancellation)} disabled={false} />
                  <SecurityToggle label="AUTO_GAIN" active={autoGain} onChange={() => setAutoGain(!autoGain)} disabled={false} />
               </div>
            </Section>
          )}

          {activeTab === 'notifications' && (
            <Section title="System Alerts" subtitle="Customize acoustic and visual feedback for session events.">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                  <div className="space-y-6">
                    <label className="text-[10px] font-normal text-neutral-600 uppercase tracking-[0.4em] mb-4 block">Participant Join</label>
                    <SecurityToggle label="AUDITORY_ALERT" active={notifJoinSound} onChange={() => setNotifJoinSound(!notifJoinSound)} disabled={false} />
                    <SecurityToggle label="VISUAL_INDICATOR" active={notifJoinVisual} onChange={() => setNotifJoinVisual(!notifJoinVisual)} disabled={false} />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[10px] font-normal text-neutral-600 uppercase tracking-[0.4em] mb-4 block">Participant Leave</label>
                    <SecurityToggle label="AUDITORY_ALERT" active={notifLeaveSound} onChange={() => setNotifLeaveSound(!notifLeaveSound)} disabled={false} />
                    <SecurityToggle label="VISUAL_INDICATOR" active={notifLeaveVisual} onChange={() => setNotifLeaveVisual(!notifLeaveVisual)} disabled={false} />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[10px] font-normal text-neutral-600 uppercase tracking-[0.4em] mb-4 block">Incoming Chat</label>
                    <SecurityToggle label="AUDITORY_ALERT" active={notifChatSound} onChange={() => setNotifChatSound(!notifChatSound)} disabled={false} />
                    <SecurityToggle label="VISUAL_INDICATOR" active={notifChatVisual} onChange={() => setNotifChatVisual(!notifChatVisual)} disabled={false} />
                  </div>
               </div>
            </Section>
          )}

          {activeTab === 'shortcuts' && (
            <Section title="Interface Bindings" subtitle="Quick execution commands for system functions.">
              <div className="bg-neutral-950 border border-white/5 p-8">
                <ShortcutItem keys={["M"]} action="Audio_Mute" />
                <ShortcutItem keys={["V"]} action="Optic_Disable" />
                <ShortcutItem keys={["C"]} action="Sidebar_Comms" />
                <ShortcutItem keys={["Esc"]} action="Abort_Overlay" />
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="space-y-12">
    <div className="space-y-4">
      <h3 className="text-6xl font-thin text-white tracking-tight uppercase leading-none">{title}</h3>
      <p className="text-neutral-700 text-xs font-light uppercase tracking-[0.4em]">{subtitle}</p>
    </div>
    <div className="pt-6">{children}</div>
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-6 px-4 py-5 transition-all text-[10px] font-normal uppercase tracking-[0.3em] border-l-2 ${active ? 'bg-white/5 text-white border-white' : 'text-neutral-700 hover:text-white border-transparent'}`}
  >
    <span className={`w-6 h-6 flex items-center justify-center ${active ? 'text-white' : 'text-neutral-800'}`}>{icon}</span>
    {label}
  </button>
);

const DeviceSelector: React.FC<{ label: string; value: string; options: MediaDeviceInfo[]; onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="space-y-4">
    <label className="text-[10px] font-normal text-neutral-500 uppercase tracking-[0.4em]">{label}</label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-neutral-900 border border-white/5 py-6 px-8 text-xl text-white appearance-none outline-none focus:border-white transition-all font-light tracking-normal cursor-pointer"
    >
      {options.length === 0 ? <option value="default">SYSTEM_DEFAULT</option> : options.map(o => <option key={o.deviceId} value={o.deviceId}>{o.label || `DEV_${o.deviceId.slice(0, 5)}`}</option>)}
    </select>
  </div>
);

const SecurityToggle: React.FC<{ label: string; active: boolean; onChange: () => void; disabled: boolean }> = ({ label, active, onChange, disabled }) => (
  <button 
    onClick={!disabled ? onChange : undefined}
    className={`w-full flex items-center justify-between p-8 bg-neutral-950 border border-white/5 transition-all ${disabled ? 'opacity-20 cursor-not-allowed' : 'hover:border-white/10'}`}
  >
    <span className={`text-sm font-light uppercase tracking-[0.3em] ${active && !disabled ? 'text-white' : 'text-neutral-600'}`}>{label}</span>
    <div className={`w-14 h-7 p-1 border ${active ? 'border-white bg-white' : 'border-neutral-800 bg-transparent'} transition-all`}>
      <div className={`w-full h-full ${active ? 'bg-black' : 'bg-neutral-800'} transition-all`} />
    </div>
  </button>
);

const QualityOption: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-10 border transition-all text-center uppercase font-normal text-xs tracking-[0.5em] ${active ? 'bg-white text-black border-white' : 'bg-transparent text-neutral-700 border-white/5 hover:border-white/10'}`}
  >
    {label}
  </button>
);

const ShortcutItem: React.FC<{ keys: string[]; action: string }> = ({ keys, action }) => (
  <div className="flex items-center justify-between py-6 border-b border-white/5 last:border-0">
    <span className="text-[10px] font-normal text-neutral-600 uppercase tracking-widest">{action}</span>
    <div className="flex gap-4">
      {keys.map(k => <span key={k} className="px-4 py-2 bg-neutral-900 border border-white/10 text-[10px] font-normal text-white">{k}</span>)}
    </div>
  </div>
);

const DeviceIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>;
const VideoIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const AudioIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const SecurityIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const BellIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const ShortcutIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;

export default SettingsPage;
