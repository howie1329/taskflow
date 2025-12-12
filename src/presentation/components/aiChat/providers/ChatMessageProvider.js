"use client";
import useFetchConversation from "@/hooks/ai/useFetchConversation";
import useFetchConversationMessages from "@/hooks/ai/useFetchConversationMessages";
import { useChat } from "@ai-sdk/react";
import { createContext, useContext, useEffect, useState } from "react";
import { DefaultChatTransport } from "ai";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

// Create the context
const ChatMessageContext = createContext();

export const toolArtifactsDummyData = [
  {
    status: "complete",
    toolName: "GetTasks",
    message: "Tasks fetched successfully",
    input: {
      userId: "user_2usb0Md2SjCvMehu1XHJBN2y03c",
    },
    outputs: {
      tasksCount: 27,
      tasks: [
        {
          id: "2690be01-d3f4-4e1f-85b0-57acec26961e",
          title: "Improve Main Agent Prompt",
          description:
            "Analyze the current main agent prompt and suggest improvements to enhance clarity, engagement, and effectiveness in guiding user interactions.",
          date: null,
          isCompleted: false,
          priority: "High",
        },
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          title: "Reminder: Create Project Plan for Mental Health App",
          description:
            "Work on outlining the project plan for your iOS mental health app using React Native, including features, timeline, and technical considerations.",
          date: "2024-10-15",
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "8d13367f-1cc2-43c0-bc42-59e591d26c1d",
          title: "Feature: Tags",
          description: "Work on the tags system",
          date: "2025-04-25",
          isCompleted: false,
          priority: "Low",
        },
        {
          id: "798b9425-61b1-42ab-9a3e-c4a73b96e12c",
          title: "Ticket: Work On Task Dialog",
          description:
            "Need to work on making task dialog better. add editing task and description. look into editing subtask and deleting and adding new subtask. also changing or adding a date. ",
          date: "2025-04-30",
          isCompleted: false,
          priority: "High",
        },
        {
          id: "35bf8211-a9ea-4946-8c17-c6ff5b4c8cd2",
          title: "Process User Prompt and Generate JSON",
          description:
            "Break down the user's prompt into subtasks, add helpful notes, and include priority, due date, and labels. Ensure the due date is after the current date (1743674157800).",
          date: "1743-08-23",
          isCompleted: false,
          priority: "High",
        },
        {
          id: "06198ba2-3e5b-409b-a1a2-052027aaa6ef",
          title: "Codebase Refactoring",
          description:
            "Refactor codebase for better file management and code to be more modular.",
          date: "2025-04-03",
          isCompleted: false,
          priority: "High",
        },
        {
          id: "31e2aaf5-b146-4691-a2c1-af161ce8887f",
          title: "Caching Update for Task Creation",
          description: "Update caching for creating a new task.",
          date: "2025-04-03",
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "5791b938-0c1f-4fc0-a072-6dc9094913ec",
          title: "Update Caching for IndexedDB",
          description:
            "Finish updating caching into the indexed database for all task changes, e.g., title changes. Look into using Redis before Superbase. Look into polling for indexeddb.",
          date: "2025-04-03",
          isCompleted: false,
          priority: "High",
        },
        {
          id: "5a396a76-fcf6-4b9e-8aa9-9972e400f17a",
          title: "Advanced Collaboration",
          description: "Enhance team workflows and permissions",
          date: null,
          isCompleted: false,
          priority: "High",
        },
        {
          id: "4398824d-3ba2-4425-93e0-deaa1294d789",
          title: "Integrations & API",
          description: "Expand third-party app connectivity",
          date: null,
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "9cadbf8f-a026-433d-8b01-91e386dd3ad4",
          title: "Wellness & Balance",
          description: "Promote sustainable productivity habits",
          date: null,
          isCompleted: false,
          priority: "Low",
        },
        {
          id: "a95d39b0-e177-44d5-a390-e63825e15fc4",
          title: "Accessibility & Localization",
          description: "Make the app inclusive and globally accessible",
          date: null,
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "c11affee-97a1-4b83-9e10-96dff2378085",
          title: "Offline Mode & Data Backup",
          description: "Enable offline access and secure backups",
          date: null,
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "61bf1a90-3e7b-42a5-9e32-2ac12ab34c6b",
          title: "Collaboration & Sharing",
          description: "Enable collaboration and sharing features",
          date: null,
          isCompleted: false,
          priority: "High",
        },
        {
          id: "1350d24b-2abc-46ae-9020-c3318065782c",
          title: "Calendar & Time Management Enhancements",
          description:
            "Improve calendar and time management with advanced options",
          date: null,
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "e9345898-985a-4bbb-8545-02bb79c86bff",
          title: "Monetization & Premium Expansions",
          description: "Expand monetization and premium offerings",
          date: null,
          isCompleted: false,
          priority: "High",
        },
        {
          id: "51724b49-f480-4539-8553-7238cf30378d",
          title: "Advanced Task & Project Management",
          description:
            "Enhance task and project management with advanced features",
          date: null,
          isCompleted: false,
          priority: "High",
        },
        {
          id: "2c6f10ac-aeb8-4a27-9238-d87ed53c2158",
          title: "AI-Powered Features",
          description: "Leverage AI for smarter task management",
          date: null,
          isCompleted: false,
          priority: "High",
        },
        {
          id: "7131ed77-1ba1-4216-b1c1-bb46369f697f",
          title: "Productivity & Analytics",
          description: "Provide productivity insights and analytics",
          date: null,
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "4e1f7529-bf00-4aa7-935a-f3b1e8a5c4b4",
          title: "Notes & Knowledge Management",
          description: "Enhance note-taking and knowledge management",
          date: null,
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "f970e496-d3e4-4a7d-93c0-e83dd28b8f72",
          title: "Monetization & Premium Features",
          description: "Set up monetization and premium features",
          date: null,
          isCompleted: false,
          priority: "High",
        },
        {
          id: "7ff93fac-978b-4a13-8e20-3d4b3f96bbad",
          title: "Calendar & Scheduling",
          description: "Sync tasks with calendar and schedule effectively",
          date: null,
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "9e6701ac-2976-46fe-b20a-5222f990edf5",
          title: "UI & Customization",
          description: "Customize the app's look and feel",
          date: null,
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "593d42ac-69c5-4338-93aa-d3b8a3a552b6",
          title: "Task & Project Management",
          description: "Manage tasks and projects efficiently",
          date: null,
          isCompleted: false,
          priority: "High",
        },
        {
          id: "98840537-d730-480f-ab9c-e2846b962584",
          title: "User Authentication & Data Sync",
          description: "Secure user login and data synchronization",
          date: null,
          isCompleted: false,
          priority: "High",
        },
        {
          id: "0cddc024-27b8-4d62-8786-2b25e206fb58",
          title: "Productivity Tools",
          description: "Boost productivity with timers and tracking",
          date: null,
          isCompleted: false,
          priority: "Medium",
        },
        {
          id: "123e627b-380b-4ff9-9fde-b8f2443808fb",
          title: "Notes & Documentation",
          description: "Create and organize notes with ease",
          date: "2025-07-09",
          isCompleted: false,
          priority: "Low",
        },
      ],
    },
    timestamp: "2025-12-12T09:45:56.472Z",
  },
];

export const ChatMessageProvider = ({ conversationId, children }) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  // Fetch conversation and messages from the database
  const [defaultConversationId] = useState(
    conversationId || crypto.randomUUID().toString()
  );
  const { data: conversation, isLoading: conversationLoading } =
    useFetchConversation(conversationId);
  const { data: fetchedMessages, isLoading: messagesLoading } =
    useFetchConversationMessages(conversationId);

  const [toolArtifacts, setToolArtifacts] = useState(toolArtifactsDummyData);

  // Use the useChat hook to send messages to the backend
  const { messages, sendMessage, status, setMessages } = useChat({
    id: defaultConversationId, // If no conversationId is provided, use null might need to set to a default value
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${defaultConversationId}/messages`,
      headers: async () => {
        const token = await getToken();
        return {
          Authorization: token,
        };
      },
      body: {
        conversationId: defaultConversationId,
      },
    }),
    onToolCall: (toolCall) => {
      console.log("Inside useChat onToolCallHook", toolCall);
    },
    onData: (data) => {
      console.log("Inside useChat onDataHook", data);
    },
  });

  // Set the messages from the database to the useChat hook
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages, setMessages]);

  // Collect Tool Artifacts from the useChat Hook
  useEffect(() => {
    console.log("Messages", messages);
    const tempToolArtifacts = [];
    messages.forEach((message) => {
      message.parts.forEach((part) => {
        if (part.type?.startsWith("data-artifact-")) {
          tempToolArtifacts.push(part.data);
        }
      });
    });
    setToolArtifacts(tempToolArtifacts);
    setToolArtifacts(toolArtifactsDummyData);
    console.log("Temp Tool Artifacts", tempToolArtifacts);
  }, [messages]);

  // Update the conversation title on messsages receive
  useEffect(() => {
    if (!conversation?.title && messages.length > 0) {
      queryClient.refetchQueries({
        queryKey: ["conversation", defaultConversationId],
      });
    }
  }, [messages, queryClient, defaultConversationId, conversation]);

  // Return the values to the context
  const values = {
    conversation,
    defaultConversationId,
    messages,
    sendMessage,
    status,
    conversationLoading,
    messagesLoading,
    toolArtifacts,
  };
  return (
    <ChatMessageContext.Provider value={values}>
      {children}
    </ChatMessageContext.Provider>
  );
};

// Export the context to be used in the client
export const useChatMessageContext = () => {
  const context = useContext(ChatMessageContext);
  if (!context) {
    throw new Error(
      "useChatMessageContext must be used within a ChatMessageProvider"
    );
  }
  return context;
};
