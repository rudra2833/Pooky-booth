const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const roomManager = require('./roomManager');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST'],
  },
});

// A quick health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Photo Booth Backend is running' });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Create room event
  socket.on('create-room', () => {
    const room = roomManager.createRoom(socket.id);
    socket.join(room.roomCode);
    console.log(`Room created: ${room.roomCode} by leader: ${socket.id}`);
    socket.emit('room-created', {
      roomCode: room.roomCode,
      room,
    });
  });

  // 2. Join room event
  socket.on('join-room', ({ roomCode }) => {
    console.log(`User ${socket.id} attempting to join room ${roomCode}`);
    const result = roomManager.joinRoom(roomCode, socket.id);

    if (result.error) {
      console.log(`Join error for ${socket.id}: ${result.error}`);
      if (result.error === 'Room is full.') {
        socket.emit('room-full-error');
      } else {
        socket.emit('room-error', { message: result.error });
      }
      return;
    }

    const { room } = result;
    socket.join(roomCode);
    console.log(`User ${socket.id} successfully joined room ${roomCode}`);

    // Notify the joiner they succeeded
    socket.emit('room-joined', {
      success: true,
      role: 'partner',
      roomCode,
      customization: room.customization,
    });

    // Notify the leader
    socket.to(roomCode).emit('partner-connected', {
      partnerId: socket.id,
      room,
    });

    // Relay partner's name to leader if provided
    if (data.partnerName) {
      socket.to(roomCode).emit('partner-name', { name: data.partnerName });
    }
  });

  // 3. WebRTC peer-to-peer signaling relay
  socket.on('signal', (data) => {
    const roomCode = roomManager.socketToRoom.get(socket.id);
    if (roomCode) {
      // Relay signal to the other user in the room
      socket.to(roomCode).emit('signal', data);
    }
  });

  // 4. Customization update sync (from Leader to Partner)
  socket.on('customization-update', (config) => {
    const roomCode = roomManager.socketToRoom.get(socket.id);
    if (roomCode) {
      const room = roomManager.updateCustomization(roomCode, config);
      if (room) {
        socket.to(roomCode).emit('customization-update', room.customization);
      }
    }
  });

  // 5. Customization ready transition
  socket.on('customization-ready', () => {
    const roomCode = roomManager.socketToRoom.get(socket.id);
    if (roomCode) {
      io.to(roomCode).emit('customization-ready');
    }
  });

  // 6. Synchronized timer events
  socket.on('start-countdown', ({ timerDuration }) => {
    const roomCode = roomManager.socketToRoom.get(socket.id);
    if (roomCode) {
      io.to(roomCode).emit('start-countdown', { timerDuration });
    }
  });

  socket.on('countdown-sync', ({ count }) => {
    const roomCode = roomManager.socketToRoom.get(socket.id);
    if (roomCode) {
      io.to(roomCode).emit('countdown-sync', { count });
    }
  });

  socket.on('capture-photo', ({ photoIndex }) => {
    const roomCode = roomManager.socketToRoom.get(socket.id);
    if (roomCode) {
      io.to(roomCode).emit('capture-photo', { photoIndex });
    }
  });

  socket.on('flash-trigger', () => {
    const roomCode = roomManager.socketToRoom.get(socket.id);
    if (roomCode) {
      io.to(roomCode).emit('flash-trigger');
    }
  });

  // 7. Retake specific or all photos sync
  socket.on('retake-request', ({ photoIndex }) => {
    const roomCode = roomManager.socketToRoom.get(socket.id);
    if (roomCode) {
      io.to(roomCode).emit('retake-request', { photoIndex });
    }
  });

  // 8. Strip ready transition
  socket.on('strip-ready', () => {
    const roomCode = roomManager.socketToRoom.get(socket.id);
    if (roomCode) {
      io.to(roomCode).emit('strip-ready');
    }
  });

  // 9. Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const result = roomManager.leaveRoom(socket.id);

    if (result) {
      const { roomCode, action, recipientSocketId } = result;
      console.log(`Cleanup room ${roomCode} for disconnect of ${socket.id}. Action: ${action}`);

      if (action === 'room-closed' && recipientSocketId) {
        io.to(recipientSocketId).emit('partner-disconnected', {
          message: 'Room leader disconnected. Room has been closed.',
        });
      } else if (action === 'partner-left' && recipientSocketId) {
        io.to(recipientSocketId).emit('partner-disconnected', {
          message: 'Partner disconnected. Returning to waiting screen.',
        });
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
