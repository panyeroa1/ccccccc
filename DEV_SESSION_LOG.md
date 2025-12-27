
# Orbit RTC Development Log

## Session ID: 20250525-180000
**Start**: 2025-05-25 18:00:00
**Objective**: Resolve Supabase schema mismatch errors (Undefined Columns).
**Scope boundaries**: `services/supabaseService.ts`.
**Repo state**: Post Jitsi-grade implementation.
**Files inspected**: `services/supabaseService.ts`, `types.ts`.
**Assumptions**: Supabase tables use `room_id` instead of `room`. `is_hand_raised` is currently missing from the DB schema.
**Changes**:
- Replaced all instances of `room` column with `room_id` in `supabaseService.ts`.
- Removed `is_hand_raised` from participant synchronization logic to prevent PostgREST 42703 errors.
- Added explicit error logging for all failed database operations to improve traceability.
- Mapping participant data now defaults `isHandRaised` to false on the client side.
**End**: 2025-05-25 18:15:00

## Session ID: 20250525-183000
**Start**: 2025-05-25 18:30:00
**Objective**: Final resolution for 'is_hand_raised' schema cache validation error.
**Scope boundaries**: `services/supabaseService.ts`.
**Repo state**: Stability phase.
**Changes**:
- Replaced `.select('*')` with explicit column strings (`PARTICIPANT_COLUMNS`, `MESSAGE_COLUMNS`). This prevents the Supabase PostgREST client from validating/fetching the non-existent `is_hand_raised` column from its schema cache.
- Hard-coded the payload construction in `syncParticipant` to guarantee no accidental property leakage from the `Participant` type.
- Standardized all `postgres_changes` filters to use `room_id`.
**End**: 2025-05-25 18:45:00

## Session ID: 20250525-190000
**Start**: 2025-05-25 19:00:00
**Objective**: Resolve 'is_muted' schema mismatch error.
**Scope boundaries**: `services/supabaseService.ts`.
**Repo state**: Maintenance.
**Changes**:
- Removed `is_muted`, `is_video_off`, and `is_sharing_screen` from the database selection and insertion logic.
- These fields are now treated as local UI state to ensure database stability while the underlying schema is updated or mapped correctly.
**End**: 2025-05-25 19:10:00
