# Orbit RTC - Feature Audit & Roadmap

## Current Features (Implemented)
- [x] **Landing Page**: Minimalist entry with room name.
- [x] **Lobby / Pre-join**: Device selection, preview, and name entry.
- [x] **Core Call UI**: Jitsi-like responsive grid with square tiles.
- [x] **Adaptive Grid**: Centering logic for various participant counts.
- [x] **Control Dock**: Centralized media and interaction controls.
- [x] **Screen Sharing**: Support for Entire Screen, Window, and Browser Tab.
- [x] **AI Assistant**: Gemini 2.5 Live integration for voice/audio interaction.
- [x] **Live Captions**: Real-time transcription using Gemini Live.
- [x] **Sidebar**: Chat and Participant roster.
- [x] **Settings**: Hardware configuration and security controls.
- [x] **Toasts**: Non-intrusive system notifications.

## Pending Features (Orbit Product Scope)
- [ ] **Real SFU Backend**: Currently using client-side simulation for participants.
- [ ] **Multi-party Signaling**: Logic for real peer negotiation.
- [ ] **Recording Integration**: UI exists, needs backend storage hookup.
- [ ] **Reactions Logic**: Needs broadcast to all participants.
- [ ] **Moderation Actions**: Mute-all, Kick, and Ban logic implementation.
- [ ] **Simulcast/SVC**: Adaptive bitrate logic for real WebRTC tracks.
- [ ] **E2EE**: UI indicator exists, needs WebRTC Insertable Streams.
- [ ] **Mobile Optimization**: PWA manifests and touch-specific gesture support.

## Roadmap
1. Implement Reactions UI and Animation on Tiles.
2. Add Recording State and Top Bar indicator.
3. Refine Moderation tools in the Sidebar.
4. Integrate Object Storage for simulated recordings.
