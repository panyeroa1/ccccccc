1) Orbit Visual Identity System

Brand personality

Premium, calm, engineering-grade

“Space/orbit” theme used subtly (curves, rings, parallax, depth), never loud or gimmicky

Confidence over decoration: fewer elements, strong hierarchy, precise spacing

Color system

Primary base: deep charcoal / near-black

Surface layers: slightly lighter charcoal for cards/panels

Accent: cool white + restrained electric blue for key focus states

Error: muted red, not neon

Success: muted green, not neon

Gradients are soft and sparse (1–2 per screen maximum)

Typography

Modern grotesk system font stack (SF Pro-like)

Clear size steps:

Display: big single headline

Body: readable on mobile

Micro: timestamps, metadata

Shape and depth

Card radius: large and consistent (rounded but not playful)

Shadows: soft, minimal, layered surfaces rely more on contrast than heavy blur

Borders: thin, low-contrast dividers

Motion principles

Motion should communicate state change:

join → connecting → in-call

panel open/close

mic mute feedback

Transitions: 150–220ms

Avoid dramatic animations; keep it “OS-grade”

2) Entry Page (Landing / “Join Orbit”)

Primary objective

Let user join a meeting instantly with minimal friction, while still offering Create, Schedule, and Sign in.

Layout structure (desktop)

Top bar

Left: Orbit logo mark + wordmark “Orbit”

Right: Sign in (secondary), Create meeting (primary button)

Optional: small help icon (“Test devices”)

Hero section

Headline: “Meet in Orbit.”

Subtext: “Fast, secure WebRTC meetings with crystal-clear audio.”

Main action row:

Meeting link input (full width)

Join button (primary)

Secondary row:

“Or enter a code” (short input)

“Schedule” (link)

Trust strip

3 small icons + copy:

“Encrypted transport”

“No installs”

“Works on mobile”

Footer

Privacy, Terms, Status, Docs

Layout structure (mobile)

Logo + headline at top

Large meeting link input

Big Join button

Divider then Create meeting and Sign in

Look & feel specifics

Background: subtle orbital curve shapes (very low opacity)

Center card: semi-translucent surface (glass-like but restrained)

Join input: strong focus glow in accent color

Join button: bold, high-contrast, slightly larger than typical

Micro-interactions

Pasting a valid Orbit link auto-detects room and shows:

Meeting name (if available)

“Host: …”

“Lobby enabled” badge

On Join: button becomes Connecting… with progress indicator

3) Create Meeting Flow

Create Meeting modal (or dedicated page)

Title: “Create a meeting”

Options:

Meeting name (optional)

Lobby: On/Off (default On)

Password: optional

“Allow guests” toggle

Primary action: Create & copy link

Secondary: Start now

Confirmation state

Shows a clean “Meeting created” card with:

Big room name

Copyable link field (click-to-copy behavior)

Start meeting (primary)

Share via email (secondary)

4) Pre-Join Page (Device Check)

Primary objective

Reduce first-minute friction: permissions, correct mic/cam, and confidence.

Layout (desktop)

Split screen:

Left panel: Camera preview card

Self view with subtle border

“Camera on/off” toggle

Background blur toggle (optional)

Right panel: Join controls

Display name input

Mic input meter + device dropdown

Speaker test + output dropdown

Network indicator (“Good / Fair / Poor”)

Meeting policy badges: “Lobby enabled”, “Recording allowed”, “End-to-end: transport encrypted”

Primary: Join now

Secondary: Join without audio/video

Mobile layout

Vertical stack:

Preview

Name

Mic + camera toggles (large)

Join button fixed at bottom

Look & feel specifics

Toggles are “pill switches”

Mic/cam icons change state with clear color + subtle vibration (mobile)

Audio meter is thin and elegant; not a loud waveform

Micro-interactions

Permission denied state:

Shows a single clear instruction card

“Retry permissions” button

Device change:

Preview updates instantly

Echo test:

Optional: “Play test tone” button

5) Lobby / Waiting Room (If Enabled)

Lobby page

Headline: “Waiting for host approval”

Shows:

Meeting name

Your name + avatar circle

Optional message field: “Send a note to host”

Primary action: Notify host

Secondary: “Leave”

Host admission panel (inside call)

Small side panel notification: “3 waiting”

Button: Review

List: name, join time, message, Admit/Deny

Look: calm, administrative, no harsh warnings.

6) In-Call UI (Core Jitsi-Class Experience)

Overall layout philosophy

The call is the “workspace”

Controls are accessible but never dominate

Panels slide in; video stage remains stable

A) Top Bar (thin, constant)

Left:

Orbit mark + meeting name (click to open meeting info)
Center:

Connection quality indicator (3 bars) + latency tooltip
Right:

Shield icon (security)

Participants (count)

Chat

Settings

B) Main Stage (video area)

Default: Active Speaker + Filmstrip

Large speaker tile center

Filmstrip bottom (or right on ultrawide)

“Pinned” state persists until unpinned

Alternative: Grid

Adaptive grid counts: 2x2, 3x3, 4x4

Prioritize visible tiles based on viewport

C) Bottom Control Dock (floating)

Centered dock with:

Mic

Camera

Share screen

Reactions

Raise hand

More (⋯)

Leave (red, isolated)

Dock styling:

Floating pill container

Subtle blur and border

Icons are crisp line icons

Mute/unmute has immediate state feedback

D) Side Panels (slide-in)

Chat panel

Messages stacked, timestamps compact

Host can delete message (if enabled)

Typing indicator

Participants panel

Search

Role badges: Host/Mod

Quick actions per participant:

Mute request

Pin

“More” menu (kick/ban for moderators)

Meeting info panel

Link, room lock status, lobby status

Invite section

E) Overlays and in-call cues

Muted mic shows a small persistent indicator on your tile

When speaking while muted:

“You’re muted” toast

When connection degrades:

“Switching to low bandwidth mode” toast

7) Screen Share UX (Very Important)

Starting share

When user clicks Share:

Modal prompts: “Screen / Window / Tab”

Checkbox: “Share audio” (if supported)

During share

Screen share tile gets priority with a “You are sharing” banner

Presenter controls appear:

Stop sharing

Pause (optional)

Participants can “Fit to screen / Actual size”

If presenter is pinned, it stays pinned unless user changes

Look & feel

Screen share has a subtle distinct border color (accent) to signal it’s primary content

8) Settings (In-Call)

Settings categories

Audio (input/output, noise suppression toggle)

Video (camera selection, quality presets)

Background (blur/off; optional effects)

Controls (push-to-talk optional)

Notifications

Accessibility (captions, font size)

UI

Left sidebar categories

Right content panel

“Apply” is instant; no confusing save button unless needed

9) Error/Edge States (Must Look Polished)

Connection lost

Full-width banner: “Reconnecting…”

Keeps last frame frozen with blur overlay (feels stable)

Shows:

Retry

Switch to TURN-only mode (advanced)

Leave

Device unplugged

Toast: “Microphone disconnected”

Immediately opens quick device picker

Room full / permission denied

Calm card with a single explanation + action:

“Try again” / “Contact host” / “Return home”

10) Mobile-First Considerations

Controls

Dock is larger and thumb-friendly

Chat and participants are full-screen sheets

Active speaker is default; grid is secondary

Video layout rules

In portrait:

Active speaker dominates

Filmstrip becomes horizontal mini strip

In landscape:

Grid becomes viable

Performance feel

Avoid heavy blur on low-end devices

Keep animations minimal during calls (save battery)

11) Optional “Orbit Premium” Details That Make It Feel 10x Better

Connection Quality Assistant

“Your network is unstable; reducing video resolution to maintain audio.”

Smart Layout

Automatically prioritizes screen share and dominant speaker

Instant “Quiet Join”

Default mic off when joining large meetings

Host Toolkit

“Mute all” + “Allow unmute” toggles

One-click lock room

Meeting Notes Panel (Optional)

Simple shared notes with timestamps, not a full doc app

