import { Server } from "socket.io";

let io;

export const initSocket = (httpServer, corsOptions) => {
  io = new Server(httpServer, { cors: corsOptions });

  io.on("connection", (socket) => {
    const userId =
      socket.handshake?.headers.userid || socket.handshake?.auth?.userId;
    socket.join(userId);
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
