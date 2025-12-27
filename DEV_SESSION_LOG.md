
# Orbit RTC Development Log

## Session ID: 20250525-001000
... (previous logs) ...

## Session ID: 20250525-071500
**Start**: 2025-05-25 07:15:00
**Objective**: Fix logo visibility issues across the UI.
**Summary of Changes**:
- Standardized all logo assets to `/images/logo-only.jpg` as requested.
- Updated `ParticipantGrid.tsx`: Added `group` class to `ParticipantTile` to enable hover opacity transitions for the watermark. Adjusted watermark blending and base opacity for better visibility on dark backgrounds.
- Updated `Room.tsx`: Replaced generic SVG icon in the header with the Orbit brand image.
- Updated `Landing.tsx`: Replaced splash and header placeholders with the Orbit brand image and ensured containers are sized appropriately.
**Verification**:
- Verified logo visibility on Landing page (Splash + Header).
- Verified logo visibility in Room header.
- Verified watermark visibility in Participant tiles (both base and hover states).
