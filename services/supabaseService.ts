
import { createClient } from '@supabase/supabase-js';
import { ChatMessage, Participant, LiveCaption, RoomCommand, Meeting, Profile } from '../types';

const SUPABASE_URL = 'https://rcbuikbjqgykssiatxpo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uTIwEo4TJBo_YkX-OWN9qQ_5HJvl4c5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const logDbError = (context: string, error: any) => {
  console.error(`DB_ERROR [${context}]:`, error?.message || error);
};

/**
 * PROFILES
 */
export const upsertProfile = async (profile: Profile) => {
  const { error } = await supabase
    .from('profiles')
    .upsert([{
      id: profile.id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString()
    }]);
  if (error) logDbError('upsertProfile', error);
};

/**
 * MEETINGS
 */
export const getOrCreateMeeting = async (code: string, userId: string, title: string = "Orbit Session"): Promise<Meeting | null> => {
  const { data: existing, error: fetchError } = await supabase
    .from('meetings')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from('meetings')
    .insert([{ 
      code, 
      title, 
      host_id: userId,
      settings: {} 
    }])
    .select()
    .single();

  if (createError) {
    logDbError('getOrCreateMeeting', createError);
    return null;
  }
  return created;
};

/**
 * PARTICIPANTS
 */
export const syncParticipant = async (p: Participant) => {
  const record = {
    id: p.id,
    meeting_id: p.meeting_id,
    user_id: p.user_id,
    name: p.name,
    role: p.role,
    status: p.status,
    joined_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('participants')
    .upsert([record], { onConflict: 'id' });
  
  if (error) logDbError('syncParticipant', error);
};

export const fetchParticipants = async (meetingId: string): Promise<Participant[]> => {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('meeting_id', meetingId)
    .is('left_at', null);

  if (error) {
    logDbError('fetchParticipants', error);
    return [];
  }
  
  return data.map(p => ({
    id: p.id,
    user_id: p.user_id,
    meeting_id: p.meeting_id,
    name: p.name,
    role: p.role,
    status: p.status as any,
    isMuted: false, 
    isVideoOff: false, 
    isSharingScreen: false, 
    isSpeaking: false,
    connection: 'good'
  }));
};

export const subscribeToParticipants = (meetingId: string, onUpdate: () => void) => {
  return supabase
    .channel(`participants:${meetingId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'participants', 
      filter: `meeting_id=eq.${meetingId}` 
    }, () => onUpdate())
    .subscribe();
};

/**
 * MESSAGES
 */
export const sendMessageToSupabase = async (meetingId: string, message: ChatMessage) => {
  const { error } = await supabase.from('messages').insert([{
    id: message.id,
    meeting_id: meetingId,
    sender_id: message.sender_id,
    content: message.text,
    created_at: message.timestamp,
    type: message.isAi ? 'ai' : 'text'
  }]);
  if (error) logDbError('sendMessageToSupabase', error);
};

export const subscribeToMessages = (meetingId: string, onMessage: (msg: ChatMessage) => void) => {
  return supabase
    .channel(`messages:${meetingId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `meeting_id=eq.${meetingId}` },
      (payload) => onMessage({
        id: payload.new.id,
        meeting_id: payload.new.meeting_id,
        sender_id: payload.new.sender_id,
        sender_name: 'User',
        text: payload.new.content,
        timestamp: payload.new.created_at,
        isAi: payload.new.type === 'ai'
      })
    )
    .subscribe();
};

/**
 * TRANSCRIPTIONS
 */
export const upsertCaption = async (meetingId: string, caption: LiveCaption, userId: string) => {
  const { error } = await supabase
    .from('transcriptions')
    .insert([{
      user_id: userId,
      room_name: meetingId,
      sender: caption.speakerName,
      text: caption.text,
      created_at: caption.timestamp
    }]); 
  if (error) logDbError('upsertCaption', error);
};

export const subscribeToCaptions = (meetingId: string, onUpdate: (caption: LiveCaption) => void) => {
  return supabase
    .channel(`transcriptions:${meetingId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transcriptions', filter: `room_name=eq.${meetingId}` },
      (payload) => {
        if (payload.new) {
          onUpdate({
            text: payload.new.text,
            speakerName: payload.new.sender,
            timestamp: payload.new.created_at
          });
        }
      }
    )
    .subscribe();
};

/** 
 * COMMAND SYSTEM (Internal Signaling)
 */
export const sendRoomCommand = async (command: Omit<RoomCommand, 'id'>) => {
  // Assuming a 'commands' table exists for real-time signaling as per previous logic
  const { error } = await supabase
    .from('commands')
    .insert([{ 
      id: crypto.randomUUID(),
      room_id: command.room_id,
      targetId: command.targetId,
      type: command.type,
      issuerId: command.issuerId
    }]);
  if (error) logDbError('sendRoomCommand', error);
};

export const subscribeToCommands = (meetingId: string, onCommand: (cmd: RoomCommand) => void) => {
  return supabase
    .channel(`commands:${meetingId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'commands', filter: `room_id=eq.${meetingId}` },
      (payload) => {
        const c = payload.new;
        onCommand({
          id: c.id,
          room_id: c.room_id,
          targetId: c.targetId,
          type: c.type,
          issuerId: c.issuerId
        });
      }
    )
    .subscribe();
};
