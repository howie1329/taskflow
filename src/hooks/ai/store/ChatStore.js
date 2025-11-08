import { create } from "zustand";

const useChatStore = create((set, get) => ({
  conversationId: null,
  messages: [],
  streamingStatus: "idle",
  setConversationId: (id) => {
    set({ conversationId: id });
  },
  setMessages: (messages) => {
    set({ messages: messages });
  },
  setStreamingStatus: (status) => {
    set({ streamingStatus: status });
  },
  reset: () => {
    set({ conversationId: null, messages: [], streamingStatus: "idle" });
  },

  getMessages: () => {
    return get().messages;
  },
  getStreamingStatus: () => {
    return get().streamingStatus;
  },
  getConversationId: () => {
    return get().conversationId;
  },
}));

export default useChatStore;
