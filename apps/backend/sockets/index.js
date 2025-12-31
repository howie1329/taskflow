import { Server } from "socket.io";

let io;

export const initSocket = (httpServer, corsOptions) => {
  io = new Server(httpServer, { cors: corsOptions });

  io.on("connection", (socket) => {
    const userId =
      socket.handshake?.headers.userid || socket.handshake?.auth?.userId;
    
    // Join user-specific room
    if (userId) {
      socket.join(userId);
    }

    // Handle joining conversation rooms
    socket.on("join-conversation", (conversationId) => {
      if (conversationId) {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
      }
    });

    // Handle leaving conversation rooms
    socket.on("leave-conversation", (conversationId) => {
      if (conversationId) {
        socket.leave(conversationId);
        console.log(`Socket ${socket.id} left conversation room: ${conversationId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const emitToRoom = (roomId, event, payload) => {
  if (io) {
    io.to(roomId).emit(event, payload);
    console.log("Emitting to room:", roomId, event, payload);
  }
};

export const emitToAllUsers = (event, payload) => {
  if (io) {
    io.emit(event, payload);
    console.log("Emitting to all users:", event);
  }
};
