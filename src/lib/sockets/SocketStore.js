"use client";
import { create } from "zustand";
import { io } from "socket.io-client";

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  initializeSocket: ({ userId, queryClient }) => {
    if (!userId) return null;

    const existing = get().socket;
    if (existing) return existing;

    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL, {
      auth: { userId },
    });

    socket.on("connect", () => set({ isConnected: true }));
    socket.on("disconnect", () => set({ isConnected: false }));

    socket.on("notification-created", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
    socket.on("notifications-clean-up", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    set({ socket });
    return socket;
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
    set({ socket: null, isConnected: false });
  },
}));

export default useSocketStore;
