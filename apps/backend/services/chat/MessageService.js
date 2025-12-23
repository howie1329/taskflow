export const MessageService = {
  async contextWindow(N_Context_Window = 3, formattedConversationHistory) {
    return formattedConversationHistory.slice(-N_Context_Window);
  },
};
