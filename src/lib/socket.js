import { io } from "socket.io-client";

let socket;
const SERVER_URL = import.meta.env.VITE_API_URL || undefined;

export function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, {
      path: "/socket.io",
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
