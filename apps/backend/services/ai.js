import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  createUIMessageStream,
  generateObject,
  generateText,
  pipeUIMessageStreamToResponse,
  pruneMessages,
  stepCountIs,
} from "ai";
import { embed } from "ai";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { Experimental_Agent as VercelAgent } from "ai";
import { VercelMainAgentPrompt } from "../utils/AIPrompts/VercelMainAgentPrompt.js";
import { createDecidingModelPrompt } from "../utils/AIPrompts/AiDecidingModelPrompt.js";
import { createSummaryPrompt } from "../utils/AIPrompts/AiSummaryPrompt.js";
import { VercelMiniAgents } from "../utils/AiTools/VercelMiniAgents.js";
import { conversationService } from "./conversations.js";
import { VercelAITools } from "../utils/AiTools/VercelAITools.js";

// AI Providers
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_KEY,
});

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_AI_KEY,
});

// Embedding Service
export const embeddingService = {
  embeddingModel: google.textEmbedding("gemini-embedding-001"),

  async createEmbedding(inputData) {
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: inputData,
      providerOptions: {
        google: {
          outputDimensionality: 1536,
          taskType: "SEMANTIC_SIMILARITY",
        },
      },
    });
    return embedding;
  },

  async embeddingPrompt(inputData) {
    return await this.createEmbedding(inputData);
  },

  async searchEmbedding(promptEmbedding, userId) {
    const embeddingArray = `[${promptEmbedding.join(",")}]`;

    const tasks = await db.execute(
      sql`SELECT title, description, id FROM tasks WHERE tasks.user_id = ${userId} ORDER BY vector <=> ${embeddingArray}::vector LIMIT 10`
    );

    const messages = await db.execute(
      sql`SELECT content, id FROM messages WHERE messages.user_id = ${userId} AND messages.vectors != null ORDER BY vectors <=> ${embeddingArray}::vector LIMIT 5`
    );

    const notes = await db.execute(
      sql`SELECT blocks, title, description, id FROM notes WHERE notes.user_id = ${userId} AND notes.vector != null ORDER BY vector <=> ${embeddingArray}::vector LIMIT 5`
    );

    return { tasks, messages, notes };
  },

  async formattingSearchResults(searchResults) {
    const { tasks, messages, notes } = searchResults;
    const formattedTasks = [];
    const formattedMessages = [];
    const formattedNotes = [];

    tasks.length > 0 &&
      tasks.forEach((result, index) => {
        formattedTasks.push(
          `${index + 1}. ID: ${result.id} ${result.title}: ${
            result.description
          }`
        );
      });

    messages.length > 0 &&
      messages.forEach((result, index) => {
        formattedMessages.push(
          `${index + 1}. ID: ${result.id} Content:${result.content}`
        );
      });

    notes.length > 0 &&
      notes.forEach((result, index) => {
        formattedNotes.push(
          `${index + 1}. ID: ${result.id} Title: ${result.title} Description: ${
            result.description
          }`
        );
      });

    return {
      tasks: formattedTasks,
      messages: formattedMessages,
      notes: formattedNotes,
    };
  },
};

// AI Chat Service
export const aiChatService = {
  async decidingModel(recentMessages, userContext, userQuestion) {
    const formattedRecentMessages = recentMessages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
    console.log("Formatted Recent Messages", formattedRecentMessages);
    const decidingModelSchema = z.object({
      model: z.string().describe("The model to use"),
      toolGroup: z.string().describe("The tool group to use"),
      confidenceLevel: z.number().describe("The confidence level"),
      reasoning: z.string().describe("The reasoning"),
      relatedContext: z
        .array(
          z.object({
            id: z.string().describe("The id"),
            title: z.string().describe("The title"),
            description: z.string().describe("The description"),
          })
        )
        .describe("The related context")
        .nullable(),
    });

    const { object } = await generateObject({
      model: openRouter("openai/gpt-oss-20b:free"),
      messages: formattedRecentMessages,
      schema: decidingModelSchema,
      maxOutputTokens: 800,
      temperature: 0.1,
      maxRetries: 2,
      system: createDecidingModelPrompt(userContext, userQuestion),
    });

    return object;
  },

  async newSummarization(messages) {
    console.log("Inside New Summarization Job ");
    const formattedMessages = convertToModelMessages(messages);
    const prunedFormattedMessages = pruneMessages({
      messages: formattedMessages,
      reasoning: "before-last-message",
      toolCalls: "before-last-message",
      emptyMessages: "remove",
    });
    console.log("Pruned Messages: ", prunedFormattedMessages);
    const { object } = await generateObject({
      model: openRouter("openai/gpt-4.1-nano"),
      system:
        "You are a summarization agent. You are tasked with summarizing the messages into a concise summary.",
      prompt: createSummaryPrompt({ messages: prunedFormattedMessages }),
      schema: z.object({
        summary: z.string().describe("The summary of the messages"),
        tags: z
          .array(z.string())
          .describe("The tags of the summary with a focus on users intent"),
        intent: z.string().describe("The intent of the summary"),
      }),
      maxOutputTokens: 1000,
      maxRetries: 3,
    });
    console.log("Summary Object: ", object);
    return {
      summary: object.summary,
      tags: object.tags,
      intent: object.intent,
      messageCount: prunedFormattedMessages.length,
    };
  },

  async summarization(deltaMessages) {
    console.log("Summarizing Messages");
    const formattedDeltaMessages = convertToModelMessages(deltaMessages);
    const { text } = await generateText({
      model: openRouter("openai/gpt-oss-20b:free"),
      system:
        "You are a summarization agent. You are tasked with summarizing the messages into a concise summary.",
      prompt: createSummaryPrompt(formattedDeltaMessages),
      maxOutputTokens: 500,
      temperature: 0.1,
      maxRetries: 2,
    });
    return text;
  },

  async createTitle(message) {
    const initialMessage = message.parts[0].text;
    console.log("Creating Title for conversation. Message: ", initialMessage);
    const { text: title } = await generateText({
      model: openRouter("openai/gpt-oss-20b:free"),
      system:
        "You are a title generation agent. You are tasked with generating a title for a conversation based on the content.",
      prompt: `Generate a title for a conversation based on the content: ${initialMessage}. You must return text. The title should be a single sentence and should be no more than 100 characters.`,
      maxRetries: 3,
    });
    console.log(
      "Creating Title for conversation. Message: ",
      initialMessage,
      "Title: ",
      title
    );
    return title;
  },

  async titleConversation(content, pastMessages = "") {
    console.log("Title Content", content, "Past Messages", pastMessages);
    const result = await generateText({
      model: openRouter("openai/gpt-oss-20b:free"),
      system:
        "You are a title generation agent. You are tasked with generating a title for a conversation based on the content.",
      prompt: `Generate a title for a conversation based on the content: ${content} and the past messages: ${pastMessages}. You must return text.`,
      maxOutputTokens: 100,
      temperature: 0.1,
      maxRetries: 2,
    });
    console.log("Title", result.text);
    return result.text;
  },

  async fetchModels() {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  },
};

// Vercel Chat Service
export const vercelChatService = {
  /**
   * Chats with the agent.
   * @param {string} userId - The userId of the user.
   * @param {Object} relatedContext - The related context of the conversation.
   * @param {string} userQuestion - The user's question.
   * @param {string} conversationSummary - The summary of the conversation.
   * @param {string} model - The model to use for the chat.
   * @param {Array} recentMessages - The recent messages of the conversation.
   * @param {string} conversationId - The id of the conversation.
   * @param {Object} tokensAmountObject - The tokens amount object.
   * @param {Response} res - The response object.
   */
  async chatAgent({
    userId,
    relatedContext,
    userQuestion,
    conversationSummary,
    model = "openai/gpt-4o-mini",
    recentMessages,
    conversationId,
    tokensAmountObject,
    res,
  }) {
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const miniAgent = VercelMiniAgents(writer);

        const agent = new VercelAgent({
          model: openRouter(model),
          system: VercelMainAgentPrompt({
            userContext: relatedContext,
            userId,
            userQuestion,
            conversationSummary,
          }),
          stopWhen: stepCountIs(15),
          tools: {
            TaskAgent: miniAgent.TaskAgent,
            NoteAgent: miniAgent.NoteAgent,
            WebSearchAgent: miniAgent.WebSearchAgent,
          },
          temperature: 0.7,
        });

        const result = agent.stream({
          messages: recentMessages,
        });

        writer.merge(
          result.toUIMessageStream({
            messageMetadata: ({ part }) => {
              if (part.type === "start") {
                return {
                  contextTokens: tokensAmountObject,
                  createdAt: new Date().toISOString(),
                  model: model,
                };
              }
              if (part.type === "finish") {
                return {
                  tokens: part.totalUsage.outputTokens,
                  totalTokens: part.totalUsage.totalTokens,
                };
              }
            },
            onFinish: async ({ messages }) => {
              // Need To save search results to the database
              // Need to see what is excatly being saved to the database
              console.log("Messages in onFinish", messages);
              await conversationService.addAiResponseToConversation(
                userId,
                conversationId,
                messages[0]
              );
            },
          })
        );
      },
    });

    pipeUIMessageStreamToResponse({
      response: res,
      status: 200,
      stream: stream,
    });
  },
};

// AI User Activated Services
/**
 * AI User Activated Services
 * This service is used to create a new note based on the user's message.
 * It is used to help the user create a new note based on the message they have sent.
 */
export const AIActivatedServices = {
  /**
   * Creates a new note based on the user's message.
   * @param {string} userId - The userId of the user.
   * @param {string} message - The message to create a note from.
   * @param {string} model - The model to use for the note creation.
   * @returns {string} - The note text.
   */
  async createNote(userId, message, model = "openai/gpt-5-nano") {
    console.log("INFO:", model, userId, message);
    const tools = VercelAITools();
    try {
      const agent = new VercelAgent({
        model: openRouter(model),
        system:
          "You are a note creation agent. You are tasked with creating a new note based on the user's message.",
        stopWhen: stepCountIs(4),
        tools: {
          createNote: tools.CreateNote,
        },
      });

      const result = await agent.generate({
        prompt: createNotePrompt(userId, message),
      });
      console.log("RESULT:", result.text);
      return result.text;
    } catch (error) {
      console.error("AI User Activated Services - Create Note Error:", error);
      throw error;
    }
  },
};

/**
 * Suggested Message Service
 * This service is used to generate suggested messages for the user based on the context of the conversation.
 * It is used to help the user understand the context of the conversation and to help them continue the conversation.
 * Also can just to used to help generate initial messages for the user.
 * Can add context
 */
export const suggestedMessageService = {
  /**
   * Generates suggested messages for the user based on the context of the conversation.
   * @param {Object} context - The context of the conversation.
   * @param {string} model - The model to use for the suggested messages.
   * @returns {Array} - The suggested messages.
   */
  async generateSuggestedMessages(context, model = "x-ai/grok-4-fast") {
    let systemPrompt = "";
    let recentMessagesPrompt = "";
    if (context.isContext) {
      systemPrompt = `You are apart of Taskflow, a task management tool / research tool / knowledge base tool. 
      The conversation summary is: ${context.summary}
      The conversation tags are: ${context.tags}
      The conversation intent is: ${context.intent}`;
    }
    if (context.recentMessages && context.recentMessages.length > 0) {
      recentMessagesPrompt = `The recent messages are: ${context.recentMessages
        .map((message) => message.role + ": " + message.content)
        .join("\n")}`;
    }
    try {
      const { object: suggestedMessages } = await generateObject({
        model: openRouter(model),
        prompt:
          "Generate a array of suggested 3-4 questions from the users perspective to continue the conversation. " +
          "The questions should be no more then 2 sentences each." +
          "The questions should be relevant to the conversation and the context of the conversation." +
          "They should be something the user can ask the main agent to continue the conversation." +
          systemPrompt +
          recentMessagesPrompt,
        system:
          "You are a suggested question generation agent. You are tasked with generating a array of suggested 3-4 questions for the user. " +
          "You are apart of Taskflow, a task management tool / research tool / knowledge base tool. ",
        schema: z.object({
          questions: z
            .array(
              z.object({
                id: z.string().describe("The id of the suggested question"),
                question: z.string().describe("The suggested question"),
                reason: z
                  .string()
                  .describe("The reason for the suggested message"),
              })
            )
            .describe("The suggested messages"),
        }),

        maxRetries: 3,
        temperature: 0.7,
      });
      return suggestedMessages.questions;
    } catch (error) {
      console.error(
        "Suggested Message Service - Generate Suggested Messages Error:",
        error
      );
      throw error;
    }
  },
};

// RAG Middleware

const createNotePrompt = (userId, message) => {
  return `
  
  **userId**: ${userId}
  **Message**: ${message}

  The user wants you to create a new note based on the message that has been sent to you.

  The note should be created with the following fields:
  - title: The title of the note
  - description: The description of the note
  - blocks: The blocks/content of the note
  - userId: The userId of the user


  ** The note should not include any conversation pieces **
  ** Make the note detailed if possible and something the user can use to reference later. **
  ** Based on the message if it does not make sense to be in the content of the note, do not include it. **
  ** You MUST use the createNote tool to create the note. **
  ** You can add additional context to the note if you think it will aid the user. **
  `;
};
