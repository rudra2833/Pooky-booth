# Pooky Booth - Long Distance Photo Booth 📸💖

A real-time, long-distance photo booth web application that allows two users in different locations to connect via WebSockets and WebRTC, customize their photo strip style (from 18 custom border designs!), see each other's camera feeds side-by-side, take synchronized pictures, and download their combined memories.

---

## 🌟 Tech Stack & Features
- **Frontend Core**: React JS, Vite
- **Real-Time Connectivity**: Socket.io (for synced countdowns and customization setups)
- **WebRTC Peer Streaming**: `simple-peer` (direct browser P2P video stream transmission)
- **Stitching Engine**: HTML5 Canvas API (custom crop, mirror, and stitch drawings)
- **Download Utility**: FileSaver.js (saves output canvas as high-quality PNG)
- **Visual Styling**: CSS3 + SVGs (bouncy animations, pastel glassmorphic panels, and Google Fonts)
- **Celebration Effects**: Canvas Confetti

---

## 📁 Key Folder Structure
```text
PROJECT-10 TRY/
├── backend/
│   ├── server.js            # Main Express + Socket.io server
│   ├── roomManager.js       # In-memory room manager logic
│   └── package.json
├── frontend/
│   ├── package.json
│   ├── vite.config.js       # Vite server configuration & simple-peer polyfills
│   ├── src/
│   │   ├── App.jsx          # Context wrap & step manager router
│   │   ├── main.jsx         # Stylesheets hook
│   │   ├── components/
│   │   │   ├── Room/        # Lobby, CreateRoom, JoinRoom
│   │   │   ├── Camera/      # CameraView, CameraStream, CountdownTimer
│   │   │   ├── Customization/# StripCustomizer, Pickers, StylePreview
│   │   │   ├── PhotoBooth/  # StripPreview (Confetti, Specific Retakes)
│   │   │   └── UI/          # Button, Loader, Modal
│   │   ├── context/         # RoomContext, BoothContext
│   │   ├── hooks/           # useCamera, useWebRTC, useSocket
│   │   ├── utils/           # canvasHelper (frames capture), stripGenerator (final stitch)
│   │   └── styles/          # borderDesigns (18 styles), stripStyles (sizes), index.css (cute theme)
├── logbook.md               # Continuous logbook for model state tracking
└── README.md                # This manual
```

---

## 🚀 Setup & Launch Instructions

You will need **Node.js** (v18+ recommended) installed on your system.

### 1. Launch the Backend Server
Open a terminal in the root directory:
```bash
cd backend
npm install
npm start
```
The server will boot up and start listening on port **`5000`**.

### 2. Launch the React Frontend Client
Open a second terminal window in the root directory:
```bash
cd frontend
npm install
npm run dev
```
The client dev server will launch at **`http://localhost:5173`**.

---

## 🎨 List of 18 Custom Border Styles
Our Canvas generator stitches photos with custom decorations depending on the chosen border:
1. **Classic White Border** - clean white border with thin divider lines
2. **Vintage Film** - dark border with film sprocket holes on left/right borders
3. **Pink Pooky 💖** - pink border with small red hearts and gold stars
4. **Pastel Rainbow** - soft linear rainbow gradient
5. **Retro 90s 👾** - colorful memphis-style geometric shapes
6. **Floral Garden 🌸** - mint green border with daisies and green leaves
7. **Starry Night 🌙** - dark navy border with crescent moon and stars
8. **Minimalist Black** - solid black border with thin white lines
9. **Golden Glamour ✨** - dark slate base with gold glitter stars
10. **Neon Glow ⚡** - dark background with cyan/pink double neon glow
11. **Cute Kawaii 😽** - pastel yellow with cute face smileys
12. **Christmas Special 🎄** - deep red with snow patterns and holly leaves
13. **Birthday Bash 🎂** - soft cream base with square confetti shapes
14. **Polaroid Style 📸** - clean solid white offset polaroid look
15. **Aesthetic Purple 🦄** - soft lavender base with butterfly overlays
16. **Cherry Blossom 🌸** - soft pink clusters with cherry blossom flowers
17. **Ocean Vibes 🌊** - blue gradient with starfish and wave lines
18. **Dark Romance 🌹** - deep black base with red rose swirls and green leaves

---

## 🔒 WebRTC & Camera Troubleshooting
- **HTTPS/Localhost**: Modern browsers block webcam access unless running on a secure domain (`https://`) or `localhost`.
- **Permissions**: Grant camera access inside the browser when prompted. If blocked, click the lock icon in the URL bar and select "Allow Camera".
- **NAT Traversal**: Simple-Peer is pre-configured with Google STUN servers to bypass standard home network NAT filters.
