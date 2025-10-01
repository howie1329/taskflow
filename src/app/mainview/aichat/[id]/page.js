"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, EllipsisIcon, InfoIcon, Loader2Icon } from "lucide-react";
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
    <div className="grid grid-rows-[auto_1fr_auto] h-[98vh] w-full text-sm bg-background px-2 pt-2 rounded-tr-md rounded-br-md ">
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
      <div className=" overflow-y-auto ">
        <div className="flex flex-col gap-2 ">
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
      <div className="flex flex-row justify-center">
        <ChatInputArea id={id} model={lastUserMessage?.model} />
      </div>
    </div>
  );
}

const RenderUserMessageContent = ({ userContent }) => {
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
        <p className="text-xs font-medium">You </p>
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
      <div className="text-black bg-gray-300 rounded-md w-fit px-2 py-1 text-sm">
        {userContent.content}
      </div>
      <p className="text-gray-500 text-xs">{timestamp}</p>
    </motion.div>
  );
};

const RenderAssistantMessageContent = ({ assistantContent }) => {
  const timestamp = new Date(assistantContent.created_at).toLocaleString();
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-1 items-start"
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
      <div className="text-black w-fit px-2 py-1 text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {assistantContent.content}
        </ReactMarkdown>
        <div className="flex flex-row gap-2 overflow-x-auto">
          {assistantContent.ui?.tasks.map((task) => (
            <AITaskCard task={task} key={task.id} />
          ))}
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <p className="text-gray-400 text-xs">{timestamp}</p>
        {assistantContent.total_tokens && (
          <p className="text-gray-400 text-xs">
            {assistantContent.total_tokens} Total Tokens
          </p>
        )}
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
  const buttonActive = input.trim() !== "";

  const handleSend = () => {
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
  };
  return (
    <div className="flex flex-col w-[70%] rounded-t-md  border-x border-t bg-card shadow-sm px-2">
      <textarea
        className="h-full w-full px-2 border-none outline-none focus:border-none focus:outline-none overflow-y-auto resize-none"
        placeholder="Add new message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (buttonActive && !sendAIMessage.isPending) {
              handleSend();
            }
          }
        }}
      />
      <Separator />
      <div className="flex flex-row gap-2 justify-between items-center ">
        <div className="flex flex-row gap-2 items-center justify-start">
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
        </div>
        <Button
          variant="default"
          size="sm"
          disabled={!buttonActive || sendAIMessage.isPending}
          onClick={handleSend}
        >
          {sendAIMessage.isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
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
