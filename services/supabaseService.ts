
import { createClient } from '@supabase/supabase-js';
import { ChatMessage } from '../types';

const SUPABASE_URL = 'https://rcbuikbjqgykssiatxpo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uTIwEo4TJBo_YkX-OWN9qQ_5HJvl4c5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetches the last 50 messages for a specific room.
 */
export const fetchMessages = async (roomName: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomName)
    .order('timestamp', { ascending: true })
    .limit(50);

  if (error) {
    console.error('Error fetching messages:', error);
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

/**
 * Sends a message to the Supabase backend.
 */
export const sendMessageToSupabase = async (roomName: string, message: ChatMessage) => {
  const { error } = await supabase
    .from('messages')
    .insert([{
      id: message.id,
      room_id: roomName,
      sender_id: message.senderId,
      sender_name: message.senderName,
      text: message.text,
      timestamp: message.timestamp,
      is_ai: message.isAi || false
    }]);

  if (error) {
    console.error('Error sending message:', error);
  }
};

/**
 * Subscribes to new messages in real-time.
 */
export const subscribeToMessages = (roomName: string, onMessage: (msg: ChatMessage) => void) => {
  return supabase
    .channel(`room:${roomName}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomName}`,
      },
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
