
import { createClient } from '@supabase/supabase-js';
import { ChatMessage, Participant, ConnectionQuality, LiveCaption, RoomCommand } from '../types';

const SUPABASE_URL = 'https://rcbuikbjqgykssiatxpo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uTIwEo4TJBo_YkX-OWN9qQ_5HJvl4c5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const logDbError = (context: string, error: any) => {
  console.error(`DB_ERROR [${context}]:`, error?.message || error);
};

const PARTICIPANT_COLUMNS = 'id, name, role, status, last_seen, room_id';
const MESSAGE_COLUMNS = 'id, sender_id, sender_name, text, timestamp, is_ai, room_id';

/**
 * AUTHENTICATION (Anonymous Session)
 */
export const ensureAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) logDbError('AuthSignIn', error);
    return data.session;
  }
  return session;
};

/** 
 * SIGNALING (WebRTC SDP/ICE Exchange)
 */
export const sendSignal = async (roomName: string, targetId: string, senderId: string, signal: any) => {
  await supabase.channel(`signaling:${roomName}`).send({
    type: 'broadcast',
    event: 'signal',
    payload: { targetId, senderId, signal }
  });
};

export const subscribeToSignals = (roomName: string, localId: string, onSignal: (senderId: string, signal: any) => void) => {
  return supabase
    .channel(`signaling:${roomName}`)
    .on('broadcast', { event: 'signal' }, ({ payload }) => {
      if (payload.targetId === localId || payload.targetId === 'all') {
        onSignal(payload.senderId, payload.signal);
      }
    })
    .subscribe();
};

/** 
 * COMMAND SYSTEM
 */
export const sendRoomCommand = async (command: Omit<RoomCommand, 'id'>) => {
  const { error } = await supabase
    .from('commands')
    .insert([{ 
      id: crypto.randomUUID(),
      room_id: command.room,
      targetId: command.targetId,
      type: command.type,
      issuerId: command.issuerId
    }]);
  if (error) logDbError('sendRoomCommand', error);
};

export const subscribeToCommands = (roomName: string, onCommand: (cmd: RoomCommand) => void) => {
  return supabase
    .channel(`commands:${roomName}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'commands', filter: `room_id=eq.${roomName}` },
      (payload) => {
        const c = payload.new;
        onCommand({
          id: c.id,
          room: c.room_id,
          targetId: c.targetId,
          type: c.type,
          issuerId: c.issuerId
        });
      }
    )
    .subscribe();
};

/**
 * MESSAGES
 */
export const sendMessageToSupabase = async (roomName: string, message: ChatMessage) => {
  const { error } = await supabase.from('messages').insert([{
    id: message.id,
    room_id: roomName,
    sender_id: message.senderId,
    sender_name: message.senderName,
    text: message.text,
    timestamp: message.timestamp,
    is_ai: message.isAi || false
  }]);
  if (error) logDbError('sendMessageToSupabase', error);
};

export const subscribeToMessages = (roomName: string, onMessage: (msg: ChatMessage) => void) => {
  return supabase
    .channel(`messages:${roomName}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomName}` },
      (payload) => onMessage({
        id: payload.new.id,
        senderId: payload.new.sender_id,
        senderName: payload.new.sender_name,
        text: payload.new.text,
        timestamp: payload.new.timestamp,
        isAi: payload.new.is_ai
      })
    )
    .subscribe();
};

/**
 * PARTICIPANTS (Presence & Admission)
 */
export const syncParticipant = async (roomName: string, p: Participant) => {
  const record = {
    id: p.id,
    room_id: roomName,
    name: p.name,
    role: p.role,
    status: p.status,
    last_seen: Date.now()
  };

  const { error } = await supabase
    .from('participants')
    .upsert([record], { onConflict: 'id' });
  
  if (error) logDbError('syncParticipant', error);
};

export const fetchParticipants = async (roomName: string): Promise<Participant[]> => {
  const cutoff = Date.now() - 30000;
  const { data, error } = await supabase
    .from('participants')
    .select(PARTICIPANT_COLUMNS)
    .eq('room_id', roomName)
    .gt('last_seen', cutoff);

  if (error) {
    logDbError('fetchParticipants', error);
    return [];
  }
  
  return data.map(p => ({
    id: p.id,
    name: p.name,
    role: p.role,
    status: p.status || 'approved',
    isMuted: false, 
    isVideoOff: false, 
    isSharingScreen: false, 
    isSpeaking: false,
    isHandRaised: false,
    connection: 'good'
  }));
};

export const subscribeToParticipants = (roomName: string, onUpdate: () => void) => {
  return supabase
    .channel(`participants:${roomName}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'participants', 
      filter: `room_id=eq.${roomName}` 
    }, () => onUpdate())
    .subscribe();
};

// Fix: Implement upsertCaption for real-time transcription sync
export const upsertCaption = async (roomName: string, caption: LiveCaption) => {
  const { error } = await supabase
    .from('captions')
    .upsert([{ 
      room_id: roomName,
      text: caption.text,
      speaker_name: caption.speakerName,
      timestamp: caption.timestamp
    }], { onConflict: 'room_id' });
  if (error) logDbError('upsertCaption', error);
};

// Fix: Implement subscribeToCaptions for live transcription overlay
export const subscribeToCaptions = (roomName: string, onCaption: (caption: LiveCaption) => void) => {
  return supabase
    .channel(`captions:${roomName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'captions', filter: `room_id=eq.${roomName}` },
      (payload) => {
        if (payload.new) {
          onCaption({
            text: payload.new.text,
            speakerName: payload.new.speaker_name,
            timestamp: payload.new.timestamp
          });
        }
      }
    )
    .subscribe();
};
