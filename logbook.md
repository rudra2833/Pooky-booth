# Development Logbook - Long Distance Photo Booth

This logbook records all steps, architectural details, decisions, and errors encountered during the construction of the Long Distance Photo Booth Web Application.

---

## [2026-07-03] Phase 1: Setup

### Current Stage: **Stage 1: Project Setup and Logbook Creation**

#### 1. Setup Tasks Completed:
- [x] Initialized `logbook.md` in workspace root.
- [x] Initialize `backend` directory with `package.json`.
- [x] Initialize `frontend` directory using React Vite.
- [x] Install backend dependencies (`express`, `socket.io`, `cors`, `nodemon` as devDependency).
- [x] Install frontend dependencies (`socket.io-client`, `simple-peer`, `file-saver`, `canvas-confetti`).
- [x] Configure Vite proxy & global polyfills for WebRTC simple-peer.


#### 2. Architecture & Config Notes:
- Root directory: `a:\Projects\Web Projects\PROJECT-10 TRY`
- Backend port: `5000`
- Frontend port: `5173` (Vite default)
- WebRTC library: `simple-peer` (requires bundling/polyfill support if used in Vite, we will configure a polyfill helper if standard dynamic imports or window mapping is needed, or use a custom hook).

#### 3. Errors and Resolutions:
- *(None yet)*

---

## [2026-07-03] Phase 2: Backend Development

### Current Stage: **Stage 2: Backend Development (Express + Socket.io)**

#### 1. Tasks Completed:
- [x] Implemented `backend/roomManager.js` to manage room life cycle (creation, join, update configurations, and leave/cleanup).
- [x] Implemented `backend/server.js` with Express health endpoints and Socket.io signaling & control events.
- [x] Started backend server on port 5000 and verified running state.

#### 2. Architecture & Config Notes:
- Room states are managed completely in-memory using JavaScript ES6 Maps.
- A single relay event `signal` facilitates multi-peer WebRTC connection exchanges. Since only 2 peers occupy a room, signaling data is routed directly to the alternate peer in the room, bypassing complex client-side routing.
- Standard timer sync handles countdown ticks on both screens simultaneously to ensure simultaneous photo capturing.


---

## [2026-07-03] Phase 3: Frontend CSS & Context Layer

### Current Stage: **Stage 3: Frontend CSS & Context Layer**

#### 1. Tasks Completed:
- [x] Created `frontend/src/styles/index.css` defining the cute/pooky pastel CSS design system.
- [x] Configured `main.jsx` to load this design system stylesheet.
- [x] Implemented `RoomContext.js` and `BoothContext.js` to manage socket events, room connectivity, step transitions, and photo capture state.
- [x] Created `useCamera.js` hook to handle getUserMedia webcams and permission/device errors.
- [x] Created `useWebRTC.js` hook utilizing `simple-peer` and STUN servers for peer-to-peer real-time streams.
- [x] Created `useSocket.js` hook for quick client socket access.

#### 2. Architecture & Config Notes:
- Standard STUN server configurations (`stun.l.google.com`) were implemented in simple-peer to support NAT traversal.
- `useCamera.js` handles unmount cleanup by explicitly calling `.stop()` on all audio/video tracks.
- `BoothContext` receives events from socket, updates local customization state, and manages retakes (either index-based or full).

---

## [2026-07-03] Phase 4: Room UI & Live Connection Status

### Current Stage: **Stage 4: Room UI & Live Connection Status**

#### 1. Tasks Completed:
- [x] Created `frontend/src/components/UI/Button.jsx` and `Button.css` for cute bubble buttons.
- [x] Created `frontend/src/components/UI/Loader.jsx` and `Loader.css` for loading state indicators.
- [x] Created `frontend/src/components/UI/Modal.jsx` and `Modal.css` for system warnings/results.
- [x] Created `frontend/src/components/Room/RoomHome.jsx`, `CreateRoom.jsx`, `JoinRoom.jsx`, and `Room.css` for managing room entry and real-time status.
- [x] Updated `frontend/src/App.jsx` to render screens based on the current active step and incorporate contexts.

#### 2. Architecture & Config Notes:
- Room input is validated using RegExp (`/[^0-9]/g`) to restrict inputs to 6-digit numeric codes.
- "Copy Code" utilizes browser navigator clipboard APIs with a temporary state feedback (`Copied! ✨`).
- App step updates automatically transition from the lobby, customization settings, webcam capture screen, and final strips.

---

## [2026-07-03] Phase 5: Customization Screen & 18 Border Styles

### Current Stage: **Stage 5: Customization Screen & 18 Border Styles**

#### 1. Tasks Completed:
- [x] Programmed `borderDesigns.js` which houses color/gradient descriptions and canvas drawing APIs for 18 custom border designs (Pooky, Rainbow, Retro, Vintage, Starry, Christmas, etc.).
- [x] Programmed `stripStyles.js` containing configurations for layouts (vertical vs. grid), sizing, fonts, and dimensions.
- [x] Coded picker sub-components: `StylePicker.jsx`, `LayoutPicker.jsx`, and `TextOptions.jsx` for selecting values.
- [x] Coded the `StylePreview.jsx` component that renders a simulated photo strip layout.
- [x] Built the master `StripCustomizer.jsx` dashboard (controls on left, real-time preview on right).
- [x] Connected Socket.io update events: Leader updates update the partner's screen in real time. Disabled controls and showed alert overlay to Partner.
- [x] Mounted `StripCustomizer` inside `App.jsx`.

#### 2. Architecture & Config Notes:
- To allow the preview and stitching engine to share identical border visual properties, we created a canvas `drawBorder` routine inside each border's definition object.
- Soft lock rules: If a user selects 3 photo slots, the grid layout is automatically disabled, as a 3-photo grid does not form a symmetrical dual column.
- Real-time socket message `customization-update` relays state variables between the two participants to ensure synchronization.

---

## [2026-07-03] Phase 6: WebRTC Video Stream & Layout

### Current Stage: **Stage 6: WebRTC Video Stream & Layout**

#### 1. Tasks Completed:
- [x] Created `frontend/src/components/Camera/CameraStream.jsx` which hosts individual `<video>` frames and handles local mirror flips.
- [x] Created `frontend/src/components/Camera/CameraView.jsx` displaying the split live camera stream under a preview frame modeled after the chosen border style.
- [x] Coded connection status flags and exit handlers to reset signaling loops.
- [x] Mounted `CameraView` inside `App.jsx`.

#### 2. Architecture & Config Notes:
- To maintain perfect symmetry on both screens (Room Leader always on the left, Partner always on the right), we dynamically map the local/remote streams:
  - Left Feed: `role === 'leader' ? localStream : remoteStream`
  - Right Feed: `role === 'leader' ? remoteStream : localStream`
- Standard WebRTC handles mirrored self-previews locally (`transform: scaleX(-1)`) while transmitting unmirrored or mirrored streams across simple-peer naturally.

---

## [2026-07-03] Phase 7: Synchronized Timer & Dual Photo Capture

### Current Stage: **Stage 7: Synchronized Timer & Dual Photo Capture**

#### 1. Tasks Completed:
- [x] Created `frontend/src/utils/canvasHelper.js` with `captureSplitFrame` function to crop and combine two video sources side-by-side.
- [x] Configured `<CameraStream>` with unique DOM `id` tags (`leader-video-stream` and `partner-video-stream`) to simplify target retrieval.
- [x] Coded `frontend/src/components/Camera/CountdownTimer.jsx` and `Countdown.css` displaying a synchronized full-screen overlay for count ticks.
- [x] Integrated automated photo loop trigger: The Room Leader automatically fires the next countdown command after a 3-second delay to give users time to adjust their pose.
- [x] Connected Socket.io flash events to overlay white screens on capture triggers.

#### 2. Architecture & Config Notes:
- Split frame cropping: The canvas drawing logic crops the left-half of the leader stream (X=0, Y=0, W=width/2) and the right-half of the partner stream (X=width/2, Y=0, W=width/2).
- Horizontal Reflection: Both feeds are mirrored programmatically using canvas transformations (`ctx.translate` and `ctx.scale(-1, 1)`) to ensure the captured photos match the user's natural webcam view.
- Sequence automation: Once all photo indices are filled, the Leader client emits `strip-ready` to trigger transition of both peers to the preview screen.

---

## [2026-07-03] Phase 8: Strip Generation, Downloading & Polish

### Current Stage: **Stage 8: Strip Generation, Downloading & Polish (Final Stage)**

#### 1. Tasks Completed:
- [x] Developed `frontend/src/utils/stripGenerator.js` implementing the Canvas strip compilation algorithm.
- [x] Coded `frontend/src/components/PhotoBooth/StripPreview.jsx` and `PhotoBooth.css` presenting compiled photo strips.
- [x] Integrated `canvas-confetti` to trigger a colorful explosion upon loading the completed strip.
- [x] Integrated `file-saver` to download base64 images as high-quality local PNGs.
- [x] Created `README.md` containing folder mappings and setup commands.
- [x] Mounted `StripPreview` inside `App.jsx`.
- [x] Ran a production bundle build check (`npm run build`) and verified zero errors.

#### 2. Architecture & Config Notes:
- Dynamic Canvas Sizing: The canvas height calculates size-dependent properties like row counts, gap margins, and footer paddings dynamically to accommodate 2, 3, 4, or 6 photo slots in both single-column vertical and double-column grid layouts.

#### 3. Errors and Resolutions:
- **Error during build**: Rollup/Vite failed to parse `RoomContext.js` and `BoothContext.js` because they contained JSX tags but had standard `.js` extensions.
- **Resolution**: Renamed them to `RoomContext.jsx` and `BoothContext.jsx` respectively. Confined imports to omit extensions (e.g. `./context/RoomContext`), ensuring zero disruptions to sibling components. Vite's production compiler now bundles the entire application in under 2.5 seconds with zero build warnings.





