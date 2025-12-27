
export enum RoomState {
  LANDING = 'LANDING',
  LOBBY = 'LOBBY',
  IN_CALL = 'IN_CALL'
}

export enum ParticipantRole {
  HOST = 'host',
  MODERATOR = 'moderator',
  PARTICIPANT = 'attendee',
  AI = 'ai'
}

export type ParticipantStatus = 'online' | 'offline' | 'waiting' | 'approved' | 'denied';

export type ConnectionQuality = 'good' | 'fair' | 'poor';

export interface Profile {
  id: string;
  email?: string;
  display_name: string;
  avatar_url?: string;
}

export interface Meeting {
  id: string;
  code: string;
  title: string;
  host_id: string;
  settings: any;
}

export interface Participant {
  id: string;
  meeting_id: string;
  user_id: string;
  name: string;
  role: string;
  status: ParticipantStatus;
  isMuted: boolean;
  isVideoOff: boolean;
  isSharingScreen: boolean;
  isSpeaking: boolean;
  isHandRaised?: boolean;
  reaction?: string;
  lastSeen?: number;
}

export interface ChatMessage {
  id: string;
  meeting_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
}

export type NoiseSuppressionLevel = 'off' | 'low' | 'medium' | 'high';

export interface DeviceSettings {
  audioInputId: string;
  videoInputId: string;
  audioOutputId: string;
  noiseSuppression: NoiseSuppressionLevel;
  echoCancellation: boolean;
  autoGainControl: boolean;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'error' | 'success';
}

export interface LiveCaption {
  id?: string;
  text: string;
  speakerName: string;
  timestamp: string;
}

export type SidebarTab = 'chat' | 'participants' | 'info';

export interface RoomCommand {
  id: string;
  room_id: string;
  targetId: string | 'all';
  type: 'MUTE' | 'KICK' | 'ADMIT' | 'DENY';
  issuerId: string;
}
