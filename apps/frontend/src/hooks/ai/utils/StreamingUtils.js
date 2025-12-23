export const createUserMessage = (variables) => ({
  id: `user-${Date.now()}`,
  content: variables.newMessage,
  role: "user",
  model: variables.model,
  settings: variables.settings,
});

export const createThinkingMessage = () => ({
  id: `assistant-thinking`,
  content: "Thinking...",
  role: "Thinking",
  status: "thinking",
});

export const createAssistantMessage = () => ({
  id: `assistant-${Date.now()}`,
  content: "",
  role: "assistant",
  metadata: { timestamp: new Date().toISOString() },
});

export const processStreamResponse = async (
  response,
  queryClient,
  conversationId
) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let state = {
    accumulatedContent: "",
    jsonBuffer: "",
    textBuffer: "",
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const parts = chunk.split("\n");
    for (const part of parts) {
      await processStreamPart(part, queryClient, conversationId, state);
    }
  }
};

export const processStreamPart = async (
  part,
  queryClient,
  conversationId,
  state
) => {
  if (part.startsWith("json:")) {
    await handleJsonPart(part, queryClient, conversationId, state);
  } else if (part.startsWith("ToolCallStart:")) {
    await handleToolCallStartPart(part, queryClient, conversationId, state);
  } else if (part.startsWith("ToolCallEnd:")) {
    await handleToolCallEndPart(part, queryClient, conversationId, state);
  } else if (part.startsWith("text:")) {
    await handleTextPart(part, queryClient, conversationId, state);
  }
};

export const handleJsonPart = async (
  part,
  queryClient,
  conversationId,
  state
) => {
  state.jsonBuffer += part.replace("json:", "").trim();

  try {
    const jsonResponse = JSON.parse(state.jsonBuffer);

    queryClient.setQueryData(["messages", conversationId], (old) => {
      if (!old) return [];

      const filteredMessages = old.filter(
        (message) => message.id !== `assistant-thinking`
      );

      const messages = [...filteredMessages];
      const lastMessageIndex = messages.length - 1;

      if (
        lastMessageIndex >= 0 &&
        messages[lastMessageIndex].role === "assistant"
      ) {
        messages[lastMessageIndex] = {
          ...messages[lastMessageIndex],

          ui: jsonResponse.response.data,
          metadata: jsonResponse.response.metadata,
        };
      }

      return messages;
    });

    state.jsonBuffer = "";
    state.accumulatedContent = "";
  } catch (err) {
    console.error(err);
  }
};

export const handleToolCallStartPart = async (
  part,
  queryClient,
  conversationId
) => {
  try {
    const toolCall = JSON.parse(part.replace("ToolCallStart:", "").trim());

    const tool_call_start_message = {
      id: toolCall.call_id,
      content: `${toolCall.name} has started`,
      role: "tool",
      status: "started",
    };

    queryClient.setQueryData(["messages", conversationId], (old) => {
      if (!old) return [];
      const old_messages = [...old];
      const last_message_index = old_messages.length - 1;
      const last_message = old_messages[last_message_index];

      const sliced_messages = old_messages.slice(0, last_message_index);
      sliced_messages.push(tool_call_start_message);
      sliced_messages.push(last_message);
      return sliced_messages;
    });
  } catch (err) {
    console.error(err);
  }
};

export const handleToolCallEndPart = async (
  part,
  queryClient,
  conversationId
) => {
  try {
    const toolCall = JSON.parse(part.replace("ToolCallEnd:", "").trim());

    const tool_call_end_message = {
      id: toolCall.call_id,
      content: `${toolCall.name} has ended`,
      role: "tool",
      status: "completed",
    };

    queryClient.setQueryData(["messages", conversationId], (old) => {
      if (!old) return [];
      const old_messages = [...old];
      const tool_call_message = old_messages.find(
        (message) => message.id === tool_call_end_message.id
      );
      if (tool_call_message) {
        tool_call_message.status = tool_call_end_message.status;
        tool_call_message.content = tool_call_end_message.content;
      }
      return old_messages;
    });
  } catch (err) {
    console.error(err);
  }
};

// Handling text part
// backend now send id of the message in the text part
// so i can now update the message with the id not the index
export const handleTextPart = async (
  part,
  queryClient,
  conversationId,
  state
) => {
  // Split by "text:" to handle multiple concatenated messages
  const jsonStrings = part.split("text:").filter((s) => s.trim());

  for (const jsonString of jsonStrings) {
    try {
      const textChunk = JSON.parse(jsonString.trim());

      queryClient.setQueryData(["messages", conversationId], (old) => {
        if (!old) return [];

        const old_message = [...old];
        const existing_message = old_message.find(
          (message) => message.id === textChunk.id
        );
        if (existing_message) {
          existing_message.content += textChunk.text; // Accumulate!
          return old_message;
        }

        const new_message = {
          id: textChunk.id,
          content: textChunk.text,
          role: "assistant",
          metadata: { timestamp: new Date().toISOString() },
        };
        old_message.push(new_message);
        return old_message;
      });
    } catch (parseErr) {
      console.error("Failed to parse JSON:", jsonString, parseErr);
    }
  }
};
