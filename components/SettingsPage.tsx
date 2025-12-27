
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

type SettingsTab = 'devices' | 'video' | 'audio' | 'security' | 'shortcuts';

const SettingsPage: React.FC<SettingsPageProps> = ({ isOpen, onClose, devices, setDevices, role, roomName }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('devices');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl h-[700px] bg-[#0d0d0d] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex overflow-hidden rounded-sm transition-all scale-in-center">
        
        {/* Sidebar */}
        <div className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-5 h-5 rounded-sm bg-blue-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Settings</span>
          </div>

          <nav className="flex-1 space-y-1">
            <TabButton active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} label="Devices" icon={<DeviceIcon />} />
            <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} label="Video Quality" icon={<VideoIcon />} />
            <TabButton active={activeTab === 'audio'} onClick={() => setActiveTab('audio')} label="Audio Effects" icon={<AudioIcon />} />
            <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} label="Meeting Security" icon={<SecurityIcon />} />
            <TabButton active={activeTab === 'shortcuts'} onClick={() => setActiveTab('shortcuts')} label="Shortcuts" icon={<ShortcutIcon />} />
          </nav>

          <button 
            onClick={onClose}
            className="mt-auto flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="text-xs font-bold uppercase tracking-widest">Back to Meeting</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-gradient-to-br from-[#0d0d0d] to-[#080808]">
          {activeTab === 'devices' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <Section title="Device Configuration" subtitle="Select and test your input/output hardware.">
                <div className="grid grid-cols-1 gap-8">
                  <DeviceSelector 
                    label="Camera" 
                    value={devices.videoInputId} 
                    options={availableDevices.filter(d => d.kind === 'videoinput')}
                    onChange={(val) => setDevices({...devices, videoInputId: val})}
                  />
                  <DeviceSelector 
                    label="Microphone" 
                    value={devices.audioInputId} 
                    options={availableDevices.filter(d => d.kind === 'audioinput')}
                    onChange={(val) => setDevices({...devices, audioInputId: val})}
                  />
                  <DeviceSelector 
                    label="Speaker" 
                    value={devices.audioOutputId} 
                    options={availableDevices.filter(d => d.kind === 'audiooutput')}
                    onChange={(val) => setDevices({...devices, audioOutputId: val})}
                  />
                </div>
              </Section>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <Section title="Video Quality" subtitle="Optimizing for network performance or clarity.">
                 <div className="space-y-4">
                    <QualityOption label="720p (HD)" description="Standard high definition for most calls." active />
                    <QualityOption label="360p (Standard)" description="Lower bandwidth usage for unstable networks." />
                    <QualityOption label="Auto (Adaptive)" description="Orbit dynamic scaling based on real-time jitter." />
                 </div>
                 <div className="mt-8 p-6 bg-neutral-900/50 border border-white/5 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-bold text-white uppercase tracking-wider">Background Blur</span>
                       <div className="w-10 h-5 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-medium">Use AI to mask your environment during the call.</p>
                 </div>
              </Section>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <Section title="Meeting Security" subtitle="Host controls for privacy and moderation.">
                 <div className="grid grid-cols-1 gap-4">
                    <SecurityToggle 
                      label="Lobby Enabled" 
                      description="Guests must wait for host approval to enter." 
                      active={true} 
                      disabled={role !== ParticipantRole.HOST} 
                    />
                    <SecurityToggle 
                      label="Lock Meeting" 
                      description="Prevent anyone else from joining the meeting room." 
                      active={false} 
                      disabled={role !== ParticipantRole.HOST} 
                    />
                    <SecurityToggle 
                      label="Participants can share screen" 
                      description="Allow all users to broadcast their display." 
                      active={true} 
                      disabled={role !== ParticipantRole.HOST} 
                    />
                 </div>
                 {role !== ParticipantRole.HOST && (
                   <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
                      <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Note: Only the host can modify these settings.</p>
                   </div>
                 )}
              </Section>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <Section title="Keyboard Shortcuts" subtitle="Control Orbit without touching your mouse.">
                <div className="grid grid-cols-1 gap-2">
                  <ShortcutItem keys={["M"]} action="Mute / Unmute" />
                  <ShortcutItem keys={["V"]} action="Camera On / Off" />
                  <ShortcutItem keys={["C"]} action="Open Chat" />
                  <ShortcutItem keys={["P"]} action="Participants List" />
                  <ShortcutItem keys={["S"]} action="Share Screen" />
                  <ShortcutItem keys={["R"]} action="Raise Hand" />
                  <ShortcutItem keys={["Esc"]} action="Close Sidebar / Settings" />
                </div>
              </Section>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400">
               <Section title="Advanced Audio" subtitle="Signal processing for crystal clear voice.">
                 <div className="space-y-6">
                   <AudioProcessingItem label="Noise Suppression" description="Removes background hums and fans." active />
                   <AudioProcessingItem label="Echo Cancellation" description="Prevents feedback when using speakers." active />
                   <AudioProcessingItem label="Auto Gain Control" description="Maintains consistent volume levels." />
                 </div>
               </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
      <p className="text-neutral-500 text-sm font-medium mt-1">{subtitle}</p>
    </div>
    <div className="pt-2">{children}</div>
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-sm transition-all text-sm font-bold tracking-tight ${active ? 'bg-blue-600/10 text-blue-500 shadow-[inset_4px_0_0_0_#2563eb]' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
  >
    <span className={`w-5 h-5 flex items-center justify-center ${active ? 'text-blue-500' : 'text-neutral-600'}`}>{icon}</span>
    {label}
  </button>
);

const DeviceSelector: React.FC<{ label: string; value: string; options: MediaDeviceInfo[]; onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">{label}</label>
    <div className="relative group">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#151515] border border-white/5 rounded-sm p-4 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer transition-all hover:border-white/10"
      >
        {options.length === 0 ? (
          <option>No devices found</option>
        ) : (
          options.map(o => (
            <option key={o.deviceId} value={o.deviceId}>{o.label || `${label} ${o.deviceId.slice(0, 5)}`}</option>
          ))
        )}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const SecurityToggle: React.FC<{ label: string; description: string; active: boolean; disabled: boolean }> = ({ label, description, active, disabled }) => (
  <div className={`flex items-center justify-between p-5 bg-[#111] border border-white/5 rounded-sm transition-opacity ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-white/10'}`}>
    <div>
      <h4 className="text-sm font-bold text-white tracking-tight">{label}</h4>
      <p className="text-[10px] text-neutral-500 font-medium">{description}</p>
    </div>
    <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-neutral-800'}`}>
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
    </div>
  </div>
);

const QualityOption: React.FC<{ label: string; description: string; active?: boolean }> = ({ label, description, active }) => (
  <div className={`flex items-center justify-between p-4 bg-[#111] border rounded-sm cursor-pointer transition-all ${active ? 'border-blue-600 bg-blue-600/5' : 'border-white/5 hover:border-white/10'}`}>
    <div>
      <h4 className={`text-sm font-bold ${active ? 'text-blue-500' : 'text-white'}`}>{label}</h4>
      <p className="text-[10px] text-neutral-500">{description}</p>
    </div>
    {active && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
  </div>
);

const AudioProcessingItem: React.FC<{ label: string; description: string; active?: boolean }> = ({ label, description, active }) => (
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm font-bold text-white tracking-tight">{label}</h4>
      <p className="text-[10px] text-neutral-500 font-medium">{description}</p>
    </div>
    <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-neutral-800'}`}>
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
    </div>
  </div>
);

const ShortcutItem: React.FC<{ keys: string[]; action: string }> = ({ keys, action }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <span className="text-xs font-medium text-neutral-400">{action}</span>
    <div className="flex gap-1">
      {keys.map(k => (
        <span key={k} className="px-2 py-1 bg-neutral-800 border border-white/10 rounded text-[9px] font-black text-white min-w-[24px] text-center">{k}</span>
      ))}
    </div>
  </div>
);

// Icons
const DeviceIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>;
const VideoIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const AudioIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const SecurityIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const ShortcutIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;

export default SettingsPage;
