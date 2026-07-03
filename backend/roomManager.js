class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> roomObject
    this.socketToRoom = new Map(); // socketId -> roomCode
  }

  // Generate a unique 6-digit code
  generateRoomCode() {
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.rooms.has(code));
    return code;
  }

  // Create a new room with a leader
  createRoom(socketId) {
    const roomCode = this.generateRoomCode();
    const room = {
      roomCode,
      leader: { socketId, name: 'Room Leader' },
      partner: null,
      customization: {
        size: 4, // default 4 photos
        layout: 'vertical', // default vertical
        style: 'classic-white', // default style
        dateEnabled: true,
        text: '',
        font: 'font-retro',
      },
      status: 'waiting', // waiting, connected, customized, shooting, done
      photos: []
    };

    this.rooms.set(roomCode, room);
    this.socketToRoom.set(socketId, roomCode);
    return room;
  }

  // Get a room by code
  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  // Join an existing room as partner
  joinRoom(roomCode, socketId) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return { error: 'Room not found.' };
    }
    if (room.partner) {
      return { error: 'Room is full.' };
    }

    room.partner = { socketId, name: 'Partner' };
    room.status = 'connected';
    this.socketToRoom.set(socketId, roomCode);
    return { room };
  }

  // Sync customizations in the room
  updateCustomization(roomCode, config) {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.customization = { ...room.customization, ...config };
      return room;
    }
    return null;
  }

  // Handle user disconnection
  leaveRoom(socketId) {
    const roomCode = this.socketToRoom.get(socketId);
    if (!roomCode) return null;

    const room = this.rooms.get(roomCode);
    if (!room) return null;

    this.socketToRoom.delete(socketId);

    const isLeader = room.leader && room.leader.socketId === socketId;

    if (isLeader) {
      // Leader left, cleanup the room completely
      this.rooms.delete(roomCode);
      if (room.partner) {
        this.socketToRoom.delete(room.partner.socketId);
      }
      return { roomCode, action: 'room-closed', recipientSocketId: room.partner?.socketId };
    } else {
      // Partner left, reset room state to waiting
      room.partner = null;
      room.status = 'waiting';
      room.photos = [];
      return { roomCode, action: 'partner-left', recipientSocketId: room.leader.socketId };
    }
  }
}

module.exports = new RoomManager();
