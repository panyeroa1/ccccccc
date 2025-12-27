
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
  
  // Interactive UI States
  const [videoQuality, setVideoQuality] = useState('720p');
  const [bgBlur, setBgBlur] = useState(false);
  const [lobbyEnabled, setLobbyEnabled] = useState(true);
  const [lockMeeting, setLockMeeting] = useState(false);
  const [screenShareAllowed, setScreenShareAllowed] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGain, setAutoGain] = useState(false);

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
    <div className="fixed inset-0 z-[110] flex bg-[#080808] animate-in fade-in slide-in-from-right-10 duration-500">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-8">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-10 h-10 rounded-sm bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Orbit Settings</span>
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{roomName}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <TabButton active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} label="Input & Output" icon={<DeviceIcon />} />
          <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} label="Video Quality" icon={<VideoIcon />} />
          <TabButton active={activeTab === 'audio'} onClick={() => setActiveTab('audio')} label="Audio Processing" icon={<AudioIcon />} />
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} label="Security Controls" icon={<SecurityIcon />} />
          <TabButton active={activeTab === 'shortcuts'} onClick={() => setActiveTab('shortcuts')} label="Key Bindings" icon={<ShortcutIcon />} />
        </nav>

        <button 
          onClick={onClose}
          className="mt-auto flex items-center gap-4 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-sm text-neutral-400 hover:text-white transition-all group border border-white/5"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="text-xs font-black uppercase tracking-[0.15em]">Return to Call</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#080808]">
        <div className="max-w-4xl mx-auto py-24 px-12">
          {activeTab === 'devices' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Section title="Hardware Configuration" subtitle="Configure your cameras, microphones, and audio outputs for the current session.">
                <div className="grid grid-cols-1 gap-10">
                  <DeviceSelector 
                    label="Camera Source" 
                    value={devices.videoInputId} 
                    options={availableDevices.filter(d => d.kind === 'videoinput')}
                    onChange={(val) => setDevices({...devices, videoInputId: val})}
                    description="The camera currently being used to broadcast your video feed."
                  />
                  <DeviceSelector 
                    label="Microphone Input" 
                    value={devices.audioInputId} 
                    options={availableDevices.filter(d => d.kind === 'audioinput')}
                    onChange={(val) => setDevices({...devices, audioInputId: val})}
                    description="Primary audio source. Use an external mic for best quality."
                  />
                  <DeviceSelector 
                    label="Audio Output" 
                    value={devices.audioOutputId} 
                    options={availableDevices.filter(d => d.kind === 'audiooutput')}
                    onChange={(val) => setDevices({...devices, audioOutputId: val})}
                    description="Select which device plays back participant audio."
                  />
                </div>
              </Section>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Section title="Video Resolution" subtitle="Manage your data usage and broadcast clarity.">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QualityOption 
                      label="High Definition (720p)" 
                      description="Standard clarity for professional meetings." 
                      active={videoQuality === '720p'} 
                      onClick={() => setVideoQuality('720p')}
                    />
                    <QualityOption 
                      label="Standard (360p)" 
                      description="Recommended for slower internet connections." 
                      active={videoQuality === '360p'} 
                      onClick={() => setVideoQuality('360p')}
                    />
                    <QualityOption 
                      label="Audio Only" 
                      description="Disable all outgoing video to save maximum bandwidth." 
                      active={videoQuality === 'audio-only'} 
                      onClick={() => setVideoQuality('audio-only')}
                    />
                    <QualityOption 
                      label="Adaptive Auto" 
                      description="Orbit will dynamically adjust quality based on jitter." 
                      active={videoQuality === 'auto'} 
                      onClick={() => setVideoQuality('auto')}
                    />
                 </div>
                 
                 <div className="pt-8 border-t border-white/5">
                    <SecurityToggle 
                      label="Background Blur" 
                      description="Use on-device AI to obscure your physical environment." 
                      active={bgBlur} 
                      onChange={() => setBgBlur(!bgBlur)}
                      disabled={false}
                    />
                 </div>
              </Section>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Section title="Audio Processing" subtitle="Advanced signal filtering for crystal clear communication.">
                 <div className="space-y-4">
                    <SecurityToggle 
                      label="Noise Suppression" 
                      description="Filters out background hums, fans, and key clicks." 
                      active={noiseSuppression} 
                      onChange={() => setNoiseSuppression(!noiseSuppression)}
                      disabled={false}
                    />
                    <SecurityToggle 
                      label="Acoustic Echo Cancellation" 
                      description="Prevents feedback when using speakers without headphones." 
                      active={echoCancellation} 
                      onChange={() => setEchoCancellation(!echoCancellation)}
                      disabled={false}
                    />
                    <SecurityToggle 
                      label="Auto Gain Control" 
                      description="Normalizes your volume levels automatically." 
                      active={autoGain} 
                      onChange={() => setAutoGain(!autoGain)}
                      disabled={false}
                    />
                 </div>
              </Section>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Section title="Meeting Security" subtitle="Administrative controls to maintain order and privacy.">
                 <div className="space-y-4">
                    <SecurityToggle 
                      label="Enable Lobby" 
                      description="Require manual host approval for every new participant." 
                      active={lobbyEnabled} 
                      onChange={() => setLobbyEnabled(!lobbyEnabled)}
                      disabled={role !== ParticipantRole.HOST} 
                    />
                    <SecurityToggle 
                      label="Lock Meeting Room" 
                      description="Immediately prevent any new connection attempts." 
                      active={lockMeeting} 
                      onChange={() => setLockMeeting(!lockMeeting)}
                      disabled={role !== ParticipantRole.HOST} 
                    />
                    <SecurityToggle 
                      label="Allow Screen Sharing" 
                      description="When disabled, only moderators can broadcast their screen." 
                      active={screenShareAllowed} 
                      onChange={() => setScreenShareAllowed(!screenShareAllowed)}
                      disabled={role !== ParticipantRole.HOST} 
                    />
                 </div>
                 {role !== ParticipantRole.HOST && (
                   <div className="p-5 bg-yellow-500/5 border border-yellow-500/10 rounded-sm">
                      <p className="text-xs text-yellow-500/80 font-bold uppercase tracking-widest leading-relaxed">
                        Notice: You are currently a Participant. These settings can only be modified by the Meeting Host.
                      </p>
                   </div>
                 )}
              </Section>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Section title="Key Bindings" subtitle="Keyboard shortcuts for power users.">
                <div className="bg-[#111] border border-white/5 rounded-sm overflow-hidden">
                  <ShortcutItem keys={["M"]} action="Mute / Unmute Microphone" />
                  <ShortcutItem keys={["V"]} action="Enable / Disable Camera" />
                  <ShortcutItem keys={["C"]} action="Open / Close Chat Sidebar" />
                  <ShortcutItem keys={["P"]} action="Toggle Participants List" />
                  <ShortcutItem keys={["S"]} action="Start / Stop Screen Sharing" />
                  <ShortcutItem keys={["R"]} action="Raise / Lower Hand" />
                  <ShortcutItem keys={["Esc"]} action="Close Current Overlay" />
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const Section: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="space-y-8">
    <div className="max-w-2xl">
      <h3 className="text-4xl font-bold text-white tracking-tighter mb-2">{title}</h3>
      <p className="text-neutral-500 text-base font-medium leading-relaxed">{subtitle}</p>
    </div>
    <div className="pt-4">{children}</div>
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-sm transition-all text-sm font-bold tracking-tight border ${active ? 'bg-blue-600/10 text-blue-500 border-blue-600/20 shadow-[0_0_30px_rgba(37,99,235,0.05)]' : 'text-neutral-500 hover:text-white hover:bg-white/5 border-transparent'}`}
  >
    <span className={`w-6 h-6 flex items-center justify-center ${active ? 'text-blue-500' : 'text-neutral-600'}`}>{icon}</span>
    {label}
  </button>
);

const DeviceSelector: React.FC<{ label: string; value: string; options: MediaDeviceInfo[]; onChange: (v: string) => void; description: string }> = ({ label, value, options, onChange, description }) => (
  <div className="space-y-4 max-w-xl">
    <div>
      <label className="text-xs font-black text-white uppercase tracking-[0.2em]">{label}</label>
      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">{description}</p>
    </div>
    <div className="relative group">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-white/5 rounded-sm p-5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer transition-all hover:border-white/10"
      >
        {options.length === 0 ? (
          <option value="default">Default System Device</option>
        ) : (
          options.map(o => (
            <option key={o.deviceId} value={o.deviceId}>{o.label || `${label} ${o.deviceId.slice(0, 5)}`}</option>
          ))
        )}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const SecurityToggle: React.FC<{ label: string; description: string; active: boolean; onChange: () => void; disabled: boolean }> = ({ label, description, active, onChange, disabled }) => (
  <button 
    onClick={!disabled ? onChange : undefined}
    className={`w-full flex items-center justify-between p-6 bg-[#111] border border-white/5 rounded-sm transition-all text-left ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-white/10 hover:bg-[#151515]'}`}
  >
    <div>
      <h4 className={`text-base font-bold tracking-tight ${active && !disabled ? 'text-blue-500' : 'text-white'}`}>{label}</h4>
      <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-1">{description}</p>
    </div>
    <div className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${active ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-neutral-800'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${active ? 'right-1' : 'left-1'}`} />
    </div>
  </button>
);

const QualityOption: React.FC<{ label: string; description: string; active: boolean; onClick: () => void }> = ({ label, description, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col p-6 bg-[#111] border rounded-sm cursor-pointer transition-all text-left group ${active ? 'border-blue-600 bg-blue-600/5 shadow-[0_0_30px_rgba(37,99,235,0.1)]' : 'border-white/5 hover:border-white/10 hover:bg-[#151515]'}`}
  >
    <div className="flex items-center justify-between mb-2">
      <h4 className={`text-sm font-bold uppercase tracking-widest ${active ? 'text-blue-500' : 'text-white'}`}>{label}</h4>
      <div className={`w-2 h-2 rounded-full transition-all ${active ? 'bg-blue-500 scale-125' : 'bg-neutral-800'}`} />
    </div>
    <p className="text-[10px] text-neutral-500 font-medium leading-relaxed">{description}</p>
  </button>
);

const ShortcutItem: React.FC<{ keys: string[]; action: string }> = ({ keys, action }) => (
  <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{action}</span>
    <div className="flex gap-2">
      {keys.map(k => (
        <span key={k} className="px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-sm text-[10px] font-black text-white min-w-[32px] text-center shadow-lg">{k}</span>
      ))}
    </div>
  </div>
);

// Icons
const DeviceIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>;
const VideoIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const AudioIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const SecurityIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const ShortcutIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;

export default SettingsPage;
