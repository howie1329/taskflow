import { create } from "zustand";

const useInitalChatStore = create((set, get) => ({
  messages: [],
  firstMessage: false,
  toogleFirstMessage: () => {
    set({ firstMessage: !get().firstMessage });
  },
  setMessages: (messages, id, model, isSmartContext, contextWindow) => {
    set({
      messages: {
        text: messages,
        metadata: {
          conversationId: id,
          model: model,
          isSmartContext: isSmartContext,
          contextWindow: contextWindow,
        },
      },
    });

    console.log("Messages", get().messages);
  },

  getMessages: () => {
    return get().messages;
  },
  reset: () => {
    set({ messages: [] });
  },
}));

export default useInitalChatStore;
