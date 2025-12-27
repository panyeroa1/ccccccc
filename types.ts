
export enum RoomState {
  LANDING = 'LANDING',
  LOBBY = 'LOBBY',
  IN_CALL = 'IN_CALL'
}

export enum ParticipantRole {
  HOST = 'HOST',
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT',
  AI = 'AI'
}

export type ParticipantStatus = 'waiting' | 'approved' | 'denied';

export type ConnectionQuality = 'good' | 'fair' | 'poor';

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  isMuted: boolean;
  isVideoOff: boolean;
  isSharingScreen: boolean;
  isSpeaking: boolean;
  isHandRaised?: boolean;
  avatar?: string;
  connection?: ConnectionQuality;
  reaction?: string;
  lastSeen?: number;
}

export interface RoomCommand {
  id: string;
  room: string;
  targetId: string | 'all';
  type: 'MUTE' | 'KICK' | 'ADMIT' | 'DENY';
  issuerId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

export interface DeviceSettings {
  audioInputId: string;
  videoInputId: string;
  audioOutputId: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'error' | 'success';
}

export interface LiveCaption {
  text: string;
  speakerName: string;
  timestamp: number;
}

export type SidebarTab = 'chat' | 'participants' | 'info';
