
# Orbit RTC Development Log

## Session ID: 20250525-123000
**Start**: 2025-05-25 12:30:00
**Objective**: Implement real-time auto-captions with Supabase persistence and specific UI styling (12px Roboto, 45% bg).
**Summary of Changes**:
- **Typography**: Added Google Fonts link for Roboto in `index.html`.
- **Database**: 
  - Created `captions` table integration in `supabaseService.ts`.
  - Implemented `upsertCaption` for single-row auto-updating per room.
  - Added real-time subscription for captions.
- **AI Integration**: Updated `Room.tsx` to push Gemini Live transcriptions to Supabase.
- **UI**: Overhauled `CaptionOverlay.tsx`:
  - Fixed 12px Roboto font size.
  - Applied 45% background opacity (rgba(0,0,0,0.45)).
  - Implemented one-liner horizontal layout with entry animation.
**Verification**:
- Transcriptions from Gemini Live now trigger a database update.
- All participants in the same room see the current speaker's text in the bottom bar.
- Layout remains fixed to a single line as per requirements.
**Infrastructure Note**:
- Ensure a `captions` table exists in Supabase: `room_id (text, PK)`, `text (text)`, `speaker_name (text)`, `timestamp (bigint)`.
