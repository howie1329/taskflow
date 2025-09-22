"use client";
import React, { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowUpIcon,
  EllipsisIcon,
  InfoIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import useDeleteConversation from "@/hooks/ai/useDeleteConversation";
import { AITaskCard } from "@/presentation/components/aiChat/tasks/AITaskCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <div className="grid grid-rows-[auto_1fr_auto] h-[96vh] w-full text-sm bg-card border-r border-y px-2 pt-2 rounded-tr-xl rounded-br-xl ">
      <div className="">
        <div className="flex flex-row items-center justify-between pb-2">
          <h1 className="text-xl font-medium text-center">
            {conversation?.title || "Untitled"}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisIcon className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={deleteButtonClick}>
                <Trash2Icon className="h-5 w-5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator />
      </div>
      <div className="min-h-0 overflow-y-auto flex-1">
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
    <div className="flex flex-col gap-1 items-end">
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
    </div>
  );
};

const RenderAssistantMessageContent = ({ assistantContent }) => {
  const timestamp = new Date(assistantContent.created_at).toLocaleString();
  return (
    <div className="flex flex-col gap-1 items-start">
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
    </div>
  );
};

const ChatInputArea = ({ id, model }) => {
  const { data: modelSelector } = useFetchModelSelector();
  const [aiModel, setAiModel] = useState(model);
  const [modelName, setModelName] = useState(
    modelSelector?.find((m) => m.id === model)?.name
  );
  const [isSmartContext, setIsSmartContext] = useState(false);
  const sendAIMessage = useSendAIMessage();
  const [input, setInput] = useState("");
  const buttonActive = input.trim() !== "";

  const handleSend = () => {
    sendAIMessage.mutate({
      newMessage: input,
      conversationId: id,
      model: aiModel,
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
export default Page;
