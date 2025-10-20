"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon, EllipsisIcon, InfoIcon } from "lucide-react";
import useDeleteConversation from "@/hooks/ai/useDeleteConversation";
import { AITaskCard } from "@/presentation/components/aiChat/tasks/AITaskCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import useFetchConversationMessages from "@/hooks/ai/useFetchConversationMessages";
import useFetchConversation from "@/hooks/ai/useFetchConversation";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { AIChatInputArea } from "@/presentation/components/aiChat/page/AiChatInputArea";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  AlertCircleFreeIcons,
  ArrowDown01FreeIcons,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons/index";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HugeiconsIcon } from "@hugeicons/react";
import { ScrollArea } from "@/components/ui/scroll-area";

function Page() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const { data: fetchedMessages } = useFetchConversationMessages(id);
  const { data: conversation } = useFetchConversation(id);
  const [defualtModel, setDefualtModel] = useState(null);
  const { messages, sendMessage, status, setMessages } = useChat({
    id: id,
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${id}/messages`,
      headers: async () => {
        const token = await getToken();
        return {
          Authorization: token,
        };
      },
      body: {
        conversationId: id,
      },
    }),
    messages: fetchedMessages,
  });

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
      setDefualtModel(fetchedMessages.at(-1).metadata?.model);
      console.log("Default Model", defualtModel);
    }
  }, [fetchedMessages, setMessages, defualtModel]);

  const { mutate: deleteConversation } = useDeleteConversation();
  const router = useRouter();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  if (!messages) {
    return (
      <Empty>
        <EmptyHeader>
          <Spinner />
        </EmptyHeader>
        <EmptyTitle> Loading Chat...</EmptyTitle>
      </Empty>
    );
  }

  const deleteButtonClick = () => {
    router.push("/mainview/aichat");
    deleteConversation(id);
  };

  const handleSendMessage = (message, model, isSmartContext, contextWindow) => {
    sendMessage({
      text: message,
      metadata: {
        conversationId: id,
        model: model,
        isSmartContext: isSmartContext,
        contextWindow: contextWindow,
      },
    });
  };
  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-[98vh] w-full text-sm bg-background px-2 pt-2 rounded-tr-md rounded-br-md">
      <div className="">
        <div className="flex flex-row items-center justify-between pb-2">
          <h1 className="text-xl font-medium text-center">
            {conversation?.title || "Untitled"}
          </h1>
          <ChatOptionsPopover
            chatName={conversation?.title}
            handleDeleteChat={deleteButtonClick}
          />
        </div>
        <Separator />
      </div>
      <div
        ref={messagesContainerRef}
        className="overflow-y-auto scroll-smooth pb-4"
      >
        <div className="flex flex-col gap-0.5">
          {messages.map((message) => (
            <div key={message.id}>
              {message.parts.map((part) => {
                switch (part.type) {
                  case "tool-TaskAgent":
                    return (
                      <RenderToolMessageContent
                        toolStatus={part.state}
                        key={part.id}
                        toolName={"TaskAgent"}
                      />
                    );
                  case "tool-NoteAgent":
                    return (
                      <RenderToolMessageContent
                        toolStatus={part.state}
                        key={part.id}
                        toolName={"NoteAgent"}
                      />
                    );
                  case "text":
                    if (message.role === "user") {
                      return (
                        <RenderUserMessageContent
                          messageContent={message}
                          partContent={part}
                          key={part.id}
                        />
                      );
                    } else {
                      return (
                        <RenderAssistantMessageContent
                          messageContent={message}
                          partContent={part}
                          key={part.id}
                        />
                      );
                    }
                  default:
                    return null;
                }
              })}
            </div>
          ))}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex flex-col justify-center gap-1 py-1 mx-5">
        <Separator />
        <AIChatInputArea
          id={id}
          model={defualtModel}
          handleSendMessage={handleSendMessage}
          status={status}
        />
      </div>
    </div>
  );
}

const RenderThinkingMessageContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-1 items-start"
    >
      <p className="text-xs font-medium">Thinking...</p>
      <Spinner className="w-3 h-3" />
    </motion.div>
  );
};

const RenderUserMessageContent = ({ messageContent, partContent }) => {
  const { user } = useUser();
  const timestamp = new Date(messageContent.createdAt).toLocaleString();
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-1 items-end"
    >
      <div className="flex flex-row gap-2 items-center">
        <p className="text-xs font-medium">
          {user?.firstName?.charAt(0).toUpperCase() + user?.firstName?.slice(1)}{" "}
        </p>
        {messageContent?.model && (
          <Tooltip key={"model"}>
            <TooltipTrigger>
              <InfoIcon className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p className="text-xs font-medium">Model</p>
              <p className="text-xs">{messageContent.model}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="bg-primary text-primary-foreground rounded-md max-w-[75%] px-3 py-2 text-sm border">
        {partContent.text}
      </div>
      <p className="text-muted-foreground/60 text-xs">{timestamp}</p>
    </motion.div>
  );
};

const RenderAssistantMessageContent = ({ messageContent, partContent }) => {
  const timestamp = new Date(
    messageContent?.metadata?.createdAt
  ).toLocaleString();
  const [copied, setCopied] = useState(false);
  const [reasoning, setReasoning] = useState(
    messageContent.parts.find((part) => part.type === "reasoning")?.text
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(partContent.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-1 items-start group"
    >
      <div className="flex flex-row gap-2 items-center">
        <Collapsible>
          <div className="flex flex-row gap-2 items-center">
            <p className="text-xs font-medium">Assistant</p>
            <CollapsibleTrigger>
              <HugeiconsIcon icon={ArrowDown01Icon} size={20} strokeWidth={2} />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <ScrollArea className="h-[100px] w-[75%]">
              <p className="text-xs ">{reasoning}</p>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {messageContent?.settings?.isSmartContext && (
          <span className="text-xs text-blue-500/70">🧠 Smart Context</span>
        )}
      </div>
      <div className="relative bg-muted text-foreground rounded-md max-w-[75%] px-3 py-2 text-sm border">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {partContent.text}
        </ReactMarkdown>
        <div className="flex flex-row gap-2 overflow-x-auto mt-2">
          {messageContent?.ui?.tasks?.map((task) => (
            <AITaskCard task={task} key={task.id} />
          ))}
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <p className="text-muted-foreground/60 text-xs">{timestamp}</p>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="w-4 h-4" />
          ) : (
            <CopyIcon className="w-4 h-4" />
          )}
        </Button>
      </div>
    </motion.div>
  );
};

const RenderToolMessageContent = ({ toolStatus, toolName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col gap-1 items-start my-2"
    >
      <div className="flex flex-row gap-2 items-center bg-muted/50 rounded-md px-3 py-1.5 text-xs border border-dashed">
        {toolStatus === "input-streaming" && (
          <>
            <Spinner className="w-3 h-3" />
            <span className="text-muted-foreground">{toolName}</span>
          </>
        )}
        {toolStatus === "input-available" && (
          <>
            <Spinner className="w-3 h-3" />
            <span className="text-muted-foreground">{toolName}</span>
          </>
        )}
        {toolStatus === "output-available" && (
          <>
            <CheckIcon className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">{toolName}</span>
          </>
        )}
        {toolStatus === "output-error" && (
          <>
            <AlertCircleFreeIcons className="w-3 h-3" />
            <span className="text-muted-foreground">{toolName} Error</span>
          </>
        )}
      </div>
    </motion.div>
  );
};

const ChatOptionsPopover = ({ chatName, handleDeleteChat }) => {
  return (
    <Popover>
      <PopoverTrigger>
        <EllipsisIcon className="h-5 w-5" />
      </PopoverTrigger>
      <PopoverContent
        side="left"
        sideOffset={10}
        align="start"
        alignOffset={5}
        className="grid grid-rows-[20px_25px_25px_1fr_25px] bg-card  h-[200px] p-0 shadow-md"
      >
        <div className="row-span-1 flex flex-col items-center justify-center ">
          <p className="text-xs font-medium">Chat Options</p>
          <Separator />
        </div>
        <div className="row-span-1  flex items-center justify-center ">
          <Input
            type="text"
            className="text-xs h-[95%] w-full border-none shadow-none text-center "
            value={chatName}
          />
        </div>
        <div className="row-span-1">
          {/* For linking tasks, projects, tags, etc. */}
        </div>
        <div className="row-span-1">{/* Default Chat Options */}</div>
        <div className="row-span-1  flex items-center justify-evenly gap-2 ">
          <Button
            variant="outline"
            className="text-xs h-2 w-[45%]"
            onClick={handleDeleteChat}
          >
            Delete
          </Button>
          <Button variant="outline" className="text-xs h-2 w-[45%]">
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
export default Page;
