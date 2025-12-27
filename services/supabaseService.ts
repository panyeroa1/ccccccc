
import { createClient } from '@supabase/supabase-js';
import { ChatMessage, Participant, ConnectionQuality, LiveCaption } from '../types';

const SUPABASE_URL = 'https://rcbuikbjqgykssiatxpo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uTIwEo4TJBo_YkX-OWN9qQ_5HJvl4c5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Enhanced error logger to prevent [object Object] logs by explicitly stringifying properties.
 */
const logDbError = (context: string, error: any) => {
  const message = error?.message || 'Unknown Error';
  const code = error?.code || 'NO_CODE';
  const details = error?.details || '';
  const hint = error?.hint || '';

  const fullReport = `[${code}] ${message} ${details} ${hint}`.trim();
  
  console.error(`DB_ERROR [${context}]: ${fullReport}`);
  
  if (error.code === '42P01') {
    console.warn(`CRITICAL: Table for '${context}' does not exist in Supabase. Please ensure your schema is initialized.`);
  }
};

/**
 * CAPTION OPERATIONS (Single Row Per Room)
 */

export const upsertCaption = async (roomName: string, caption: LiveCaption) => {
  const { error } = await supabase
    .from('captions')
    .upsert([{
      room: roomName,
      text: caption.text,
      speaker_name: caption.speakerName,
      timestamp: caption.timestamp
    }], { onConflict: 'room' });

  if (error) logDbError('upsertCaption', error);
};

export const subscribeToCaptions = (roomName: string, onUpdate: (caption: LiveCaption) => void) => {
  return supabase
    .channel(`captions:${roomName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'captions', filter: `room=eq.${roomName}` },
      (payload) => {
        const c = payload.new;
        if (c) {
          onUpdate({
            text: c.text,
            speakerName: c.speaker_name,
            timestamp: c.timestamp
          });
        }
      }
    )
    .subscribe();
};

/**
 * MESSAGES TABLE OPERATIONS
 */

export const fetchMessages = async (roomName: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room', roomName)
    .order('timestamp', { ascending: true })
    .limit(50);

  if (error) {
    logDbError('fetchMessages', error);
    return [];
  }

  return data.map(m => ({
    id: m.id,
    senderId: m.sender_id,
    senderName: m.sender_name,
    text: m.text,
    timestamp: m.timestamp,
    isAi: m.is_ai
  }));
};

export const sendMessageToSupabase = async (roomName: string, message: ChatMessage) => {
  const { error } = await supabase
    .from('messages')
    .insert([{
      id: message.id,
      room: roomName,
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
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `room=eq.${roomName}` },
      (payload) => {
        const m = payload.new;
        onMessage({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          text: m.text,
          timestamp: m.timestamp,
          isAi: m.is_ai
        });
      }
    )
    .subscribe();
};

/**
 * PARTICIPANTS TABLE OPERATIONS
 */

export const syncParticipant = async (roomName: string, p: Participant) => {
  const { error } = await supabase
    .from('participants')
    .upsert([{
      id: p.id,
      room: roomName,
      name: p.name,
      role: p.role,
      is_muted: p.isMuted,
      is_video_off: p.isVideoOff,
      is_sharing_screen: p.isSharingScreen,
      is_hand_raised: p.isHandRaised || false,
      // Removed 'status' / 'connection' column to fix PGRST204 errors
      last_seen: Date.now()
    }], { onConflict: 'id' });

  if (error) logDbError('syncParticipant', error);
};

export const fetchParticipants = async (roomName: string): Promise<Participant[]> => {
  const cutoff = Date.now() - 60000;
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('room', roomName)
    .gt('last_seen', cutoff);

  if (error) {
    logDbError('fetchParticipants', error);
    return [];
  }

  return data.map(p => ({
    id: p.id,
    name: p.name,
    role: p.role as any,
    isMuted: p.is_muted,
    isVideoOff: p.is_video_off,
    isSharingScreen: p.is_sharing_screen,
    isSpeaking: false,
    isHandRaised: p.is_hand_raised,
    connection: 'good' as ConnectionQuality // Default to good since DB doesn't support this column
  }));
};

export const subscribeToParticipants = (roomName: string, onUpdate: () => void) => {
  return supabase
    .channel(`participants:${roomName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'participants', filter: `room=eq.${roomName}` },
      () => onUpdate()
    )
    .subscribe();
};
