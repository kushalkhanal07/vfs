import { Server } from "socket.io";
import { appConfig } from "../config/appConfig.js";

let io = null;

export function initSocket(server) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: appConfig.clientOrigin,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register", ({ userId } = {}) => {
      if (!userId) return;
      const room = `user_${userId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.id, reason);
    });
  });

  return io;
}

export function getIO() {
  return io;
}
