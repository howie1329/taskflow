"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon, EllipsisIcon, InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { useUser } from "@clerk/nextjs";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertCircleFreeIcons,
  ArrowDown01Icon,
  NoteAddIcon,
} from "@hugeicons/core-free-icons/index";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HugeiconsIcon } from "@hugeicons/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import useHandleCreateNote from "@/hooks/ai/useHandleCreateNote";
import { ChatModelProvider } from "@/presentation/components/aiChat/providers/ChatModelProvider";
import { ChatHistoryProvider } from "@/presentation/components/aiChat/providers/ChatHistoryProvider";
import { ChatMessageProvider } from "@/presentation/components/aiChat/providers/ChatMessageProvider";
import { ChatPageClient } from "@/presentation/components/aiChat/providers/ChatPageClient";
import { ChatSuggestionProvider } from "@/presentation/components/aiChat/providers/ChatSuggestionProvider";
import { ChatContextProvider } from "@/presentation/components/aiChat/providers/ChatContextProvider";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import rehypeSanitize from "rehype-sanitize";

function Page() {
  const { id } = useParams();
  return (
    <ChatModelProvider defaultModel="x-ai/grok-4.1-fast">
      <ChatHistoryProvider>
        <ChatMessageProvider conversationId={id}>
          <ChatSuggestionProvider conversationId={id}>
            <ChatContextProvider>
              <ChatPageClient />
            </ChatContextProvider>
          </ChatSuggestionProvider>
        </ChatMessageProvider>
      </ChatHistoryProvider>
    </ChatModelProvider>
  );
}

export const RenderThinkingMessageContent = () => {
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

export const RenderUserMessageContent = ({ messageContent, partContent }) => {
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
          {user?.firstName?.charAt(0).toUpperCase() +
            user?.firstName?.slice(1)}{" "}
        </p>
        {/* Might be deprecated in the future */}
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
      <div className="bg-primary text-primary-foreground rounded-sm max-w-[75%] px-3 py-2 text-sm border">
        {partContent.text}
      </div>
    </motion.div>
  );
};

export const RenderAssistantMessageContent = ({
  messageContent,
  partContent,
}) => {
  const { createNote } = useHandleCreateNote();
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

  const handleCreateNote = async () => {
    const response = await createNote(partContent.text, messageContent.model);
    console.log("RESPONSE", response);
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
        {reasoning ? (
          <Collapsible>
            <div className="flex flex-row gap-2 items-center">
              <p className="text-xs font-medium">Assistant</p>
              <CollapsibleTrigger>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={20}
                  strokeWidth={2}
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <ScrollArea className="h-[100px] w-[75%]">
                <p className="text-xs ">{reasoning}</p>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <p className="text-xs font-medium">Assistant</p>
        )}

        {/* Might be deprecated  */}
        {messageContent?.settings?.isSmartContext && (
          <span className="text-xs text-blue-500/70">🧠 Smart Context</span>
        )}
      </div>
      <div className="relative text-foreground rounded-none w-full max-w-[65%] px-2 py-2 prose prose-sm dark:prose-invert border-r">
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize, rehypeHighlight]}
          components={{
            // Customize code blocks
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code
                  className="bg-muted px-1 py-0.5 rounded text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            // Customize links
            a({ node, ...props }) {
              return (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                />
              );
            },
          }}
        >
          {partContent.text}
        </Markdown>
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
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          onClick={handleCreateNote}
        >
          <HugeiconsIcon icon={NoteAddIcon} />
        </Button>
      </div>
    </motion.div>
  );
};

export const RenderToolMessageContent = ({ toolStatus, toolName }) => {
  console.log("Tool Status", toolStatus, toolName);
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
            <HugeiconsIcon
              icon={AlertCircleFreeIcons}
              size={20}
              strokeWidth={2}
            />
            <span className="text-muted-foreground">{toolName} Error</span>
          </>
        )}
      </div>
    </motion.div>
  );
};

export const ChatOptionsPopover = ({ chatName, handleDeleteChat }) => {
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
