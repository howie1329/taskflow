"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  EllipsisIcon,
  InfoIcon,
  Loader2Icon,
} from "lucide-react";
import useDeleteConversation from "@/hooks/ai/useDeleteConversation";
import { AITaskCard } from "@/presentation/components/aiChat/tasks/AITaskCard";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { AIModelSelector } from "@/presentation/components/aiChat/AIModelSelector";
import useFetchConversationMessages from "@/hooks/ai/useFetchConversationMessages";
import useFetchConversation from "@/hooks/ai/useFetchConversation";
import useSendAIMessage from "@/hooks/ai/useSendAIMessage";
import useFetchModelSelector from "@/hooks/ai/useFetchModelSelector";
import SettingsPopover from "@/presentation/components/aiChat/SettingsPopover";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { useUser } from "@clerk/nextjs";

function Page() {
  const { id } = useParams();
  const { data: messages } = useFetchConversationMessages(id);
  const { data: conversation } = useFetchConversation(id);
  const { mutate: deleteConversation } = useDeleteConversation();
  const router = useRouter();

  if (!messages) {
    return <div>Chat not found</div>;
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
      <div className="overflow-y-auto scroll-smooth pb-4">
        <div className="flex flex-col gap-2">
          {messages?.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <RenderUserMessageContent userContent={message} />
              ) : (
                <RenderAssistantMessageContent assistantContent={message} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row justify-center border-t pt-1">
        <ChatInputArea id={id} model={lastUserMessage?.model} />
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
      <div className="bg-primary text-primary-foreground rounded-2xl max-w-[75%] px-4 py-3 text-sm shadow-sm">
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
      <div className="relative bg-muted text-foreground rounded-md max-w-[75%] px-4 py-3 text-sm">
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

const ChatInputArea = ({ id, model }) => {
  const { data: modelSelector } = useFetchModelSelector();
  const [aiModel, setAiModel] = useState(model);
  const [modelName, setModelName] = useState(
    modelSelector?.find((m) => m.id === model)?.name
  );
  const [isSmartContext, setIsSmartContext] = useState(false);
  const [contextWindow, setContextWindow] = useState(4);
  const sendAIMessage = useSendAIMessage();
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = React.useRef(null);
  const buttonActive = input.trim() !== "";

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSend = () => {
    if (!buttonActive || sendAIMessage.isPending) return;

    sendAIMessage.mutate({
      newMessage: input,
      conversationId: id,
      model: aiModel,
      settings: {
        isSmartContext: isSmartContext,
        contextWindow: contextWindow,
      },
    });
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <motion.div
      className={`flex flex-col max-w-4xl w-full rounded-2xl border bg-card shadow-sm transition-all duration-200 mb-2 ${
        isFocused ? "border-primary/50 shadow-xl" : "border-border "
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 pt-3 pb-2">
        <textarea
          ref={textareaRef}
          className="w-full min-h-[44px] max-h-[200px] bg-transparent border-none outline-none focus:border-none focus:outline-none resize-none text-sm placeholder:text-muted-foreground/60"
          placeholder="Message Assistant... (Shift + Enter for new line)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
        />
      </div>

      <Separator />

      <div className="flex flex-row gap-2 justify-between items-center px-4 py-2">
        <div className="flex flex-row gap-2 items-center justify-start flex-1">
          <SettingsPopover
            isSmartContext={isSmartContext}
            setIsSmartContext={setIsSmartContext}
            contextWindow={contextWindow}
            setContextWindow={setContextWindow}
          />
          <AIModelSelector
            setValue={setAiModel}
            modelName={modelName}
            setModelName={setModelName}
          />

          {/* Character count - only show when typing */}
          {input.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-muted-foreground/60 ml-auto"
            >
              {input.length} chars
            </motion.span>
          )}
        </div>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: buttonActive ? 1 : 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Button
            variant="default"
            size="icon"
            className={`h-9 w-9 rounded-full transition-all ${
              buttonActive && !sendAIMessage.isPending
                ? "bg-primary hover:bg-primary/90 shadow-md"
                : "opacity-50"
            }`}
            disabled={!buttonActive || sendAIMessage.isPending}
            onClick={handleSend}
          >
            {sendAIMessage.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
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
