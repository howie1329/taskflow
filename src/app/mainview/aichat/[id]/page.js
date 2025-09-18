"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowUpIcon,
  EllipsisIcon,
  InfoIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import useFetchSingleConversation from "@/hooks/ai/useFetchSingleConversation";
import useSendAIMessage from "@/hooks/ai/useSendAIMessage";
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

function Page() {
  const { id } = useParams();
  const { data: conversation } = useFetchSingleConversation(id);
  const { mutate: deleteConversation } = useDeleteConversation();
  const router = useRouter();
  if (!conversation) {
    return <div>Chat not found</div>;
  }

  const deleteButtonClick = () => {
    router.push("/mainview/aichat");
    deleteConversation(id);
  };

  return (
    <div className="grid grid-rows-[1fr_12fr_1fr] w-[98%] h-full text-sm p-2">
      <div className="">
        <div className="flex flex-row items-center justify-between pb-2">
          <h1 className="text-xl font-medium text-center">
            {/* Find way to connect actual title not first message of conversation array */}
            {conversation[0].content.charAt(0).toUpperCase() +
              conversation[0].content.slice(1) ||
              "Missing Title of Conversation"}
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
      <div className="flex flex-col gap-2 h-[78vh] overflow-y-auto">
        {conversation?.map((message) => (
          <div key={message.id}>
            {message.role === "user" ? (
              <RenderUserMessageContent userContent={message} />
            ) : (
              <RenderAssistantMessageContent assistantContent={message} />
            )}
          </div>
        ))}
      </div>
      <ChatInputArea id={id} />
    </div>
  );
}

const RenderUserMessageContent = ({ userContent }) => {
  const timestamp = new Date(userContent.created_at).toLocaleString();
  return (
    <div className="flex flex-col gap-1 items-end">
      <p className="text-xs font-medium">You</p>
      <div className="text-black bg-white rounded-md w-fit px-2 py-1 text-sm">
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
      <p className="text-gray-500 text-xs">{timestamp}</p>
    </div>
  );
};

const ChatInputArea = ({ id }) => {
  const [aiModel, setAiModel] = useState();
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
    <div className="flex flex-col h-fit w-full rounded-md border bg-white">
      <div className="flex flex-row pt-2">
        <input
          className=" h-full w-full px-2 border-none outline-none focus:border-none focus:outline-none"
          placeholder="Add new message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          className="h-6 w-6 rounded-full"
          variant="ghost"
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
      <div className="self-end">
        <AIModelSelector value={aiModel} setValue={setAiModel} />
      </div>
    </div>
  );
};
export default Page;
