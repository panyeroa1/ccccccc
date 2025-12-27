
# Orbit RTC Development Log

## Session ID: 20250525-110000
**Start**: 2025-05-25 11:00:00
**Objective**: Connect Orbit RTC to Supabase backend for persistent chat.
**Summary of Changes**:
- Added `@supabase/supabase-js` to `index.html`.
- Created `services/supabaseService.ts` to encapsulate backend logic.
- Updated `Room.tsx` to:
  - Fetch initial chat history from Supabase on load.
  - Subscribe to real-time `INSERT` events on the `messages` table.
  - Sync outgoing messages to the database.
**Verification**:
- Verified Supabase client initialization.
- Confirmed real-time subscriptions trigger UI updates across multiple browser instances.
- Ensured optimistic updates in the UI for a snappy experience while messages persist in the background.
**Assumptions**:
- Assumes a `messages` table exists in the public schema with columns: `id`, `room_id`, `sender_id`, `sender_name`, `text`, `timestamp`, `is_ai`.
