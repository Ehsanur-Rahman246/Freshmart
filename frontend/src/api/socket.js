import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  (import.meta.env.MODE === "development" ? "http://localhost:5000" : "/");

let socket = null;
const readyListeners = new Set();

export const connectSocket = () => {
  if (socket) return socket; // already exists (connected OR connecting) — reuse it

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
  });

  socket.on("connect", () => {
    readyListeners.forEach((cb) => cb(socket));
  });

  socket.on("connect_error", (err) => {
    console.log("socket connect_error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;

// Notifies cb once a connected socket exists — immediately if already
// connected, otherwise the next time "connect" fires. Returns an unsubscribe fn.
export const onSocketReady = (cb) => {
  readyListeners.add(cb);
  if (socket?.connected) cb(socket);
  return () => readyListeners.delete(cb);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  readyListeners.clear();
};
