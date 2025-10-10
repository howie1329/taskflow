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
import { useUser } from "@clerk/nextjs";
import { AIChatInputArea } from "@/presentation/components/aiChat/page/AiChatInputArea";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

function Page() {
  const { id } = useParams();
  const { data: messages } = useFetchConversationMessages(id);
  const { data: conversation } = useFetchConversation(id);
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

  // Auto-scroll to bottom when component mounts
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

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

  const lastUserMessage = messages
    .filter((message) => message.role === "user")
    .at(-1);

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
          {messages?.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <RenderUserMessageContent userContent={message} />
              ) : message.role === "assistant" ? (
                <RenderAssistantMessageContent assistantContent={message} />
              ) : message.role === "tool" ? (
                <RenderToolMessageContent toolContent={message} />
              ) : null}
            </div>
          ))}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex flex-col justify-center gap-1 py-1 mx-5">
        <Separator />
        <AIChatInputArea id={id} model={lastUserMessage?.model} />
      </div>
    </div>
  );
}

const RenderUserMessageContent = ({ userContent }) => {
  const { user } = useUser();
  const timestamp = new Date(userContent.created_at).toLocaleString();
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
        {userContent?.model && (
          <Tooltip key={"model"}>
            <TooltipTrigger>
              <InfoIcon className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p className="text-xs font-medium">Model</p>
              <p className="text-xs">{userContent.model}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="bg-primary text-primary-foreground rounded-md max-w-[75%] px-3 py-2 text-sm border">
        {userContent.content}
      </div>
      <p className="text-muted-foreground/60 text-xs">{timestamp}</p>
    </motion.div>
  );
};

const RenderAssistantMessageContent = ({ assistantContent }) => {
  const timestamp = new Date(assistantContent.created_at).toLocaleString();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(assistantContent.content);
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
        <p className="text-xs font-medium">Assistant</p>
        {assistantContent?.ui?.analysis && (
          <Tooltip key={"analysis"}>
            <TooltipTrigger>
              <InfoIcon className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p className="text-xs font-medium">Analysis</p>
              <p className="text-xs">{assistantContent?.ui?.analysis}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {assistantContent?.ui?.suggestions && (
          <Tooltip key={"suggestions"}>
            <TooltipTrigger>
              <InfoIcon className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p className="text-xs font-medium">Suggestions</p>
              <p className="text-xs">
                {assistantContent?.ui?.suggestions.map((suggestion) => (
                  <p key={suggestion}>{suggestion}</p>
                ))}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        {assistantContent?.settings?.isSmartContext && (
          <span className="text-xs text-blue-500/70">🧠 Smart Context</span>
        )}
      </div>
      <div className="relative bg-muted text-foreground rounded-md max-w-[75%] px-3 py-2 text-sm border">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {assistantContent.content}
        </ReactMarkdown>
        <div className="flex flex-row gap-2 overflow-x-auto mt-2">
          {assistantContent.ui?.tasks.map((task) => (
            <AITaskCard task={task} key={task.id} />
          ))}
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <p className="text-muted-foreground/60 text-xs">{timestamp}</p>
        {assistantContent.total_tokens && (
          <p className="text-muted-foreground/60 text-xs">
            {assistantContent.total_tokens} Total Tokens
          </p>
        )}
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

const RenderToolMessageContent = ({ toolContent }) => {
  const isStarted = toolContent.status === "started";
  const isCompleted = toolContent.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col gap-1 items-start my-2"
    >
      <div className="flex flex-row gap-2 items-center bg-muted/50 rounded-md px-3 py-1.5 text-xs border border-dashed">
        {isStarted && (
          <>
            <Spinner className="w-3 h-3" />
            <span className="text-muted-foreground">{toolContent.content}</span>
          </>
        )}
        {isCompleted && (
          <>
            <CheckIcon className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">{toolContent.content}</span>
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
