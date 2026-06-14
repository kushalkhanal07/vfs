import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export function initSocket(userId) {
  if (!socket) {
    socket = io(API_BASE, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      if (userId) socket.emit("register", { userId });
    });
  } else if (userId) {
    socket.emit("register", { userId });
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
