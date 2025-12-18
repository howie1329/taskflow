"use client";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useState } from "react";
import { useChatMessageContext } from "./ChatMessageProvider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  Navigation03Icon,
} from "@hugeicons/core-free-icons/index";
import { AIModelSelector } from "../AIModelSelector";
import { useChatModelContext } from "./ChatModelProvider";
import { ChatHistoryPopup } from "./ChatHistoryPopup";
import { ChatSuggestionClient } from "./ChatSuggestionClient";
import { ChatContextPopup } from "./ChatContextPopup";
import {
  Label,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const MAX_INPUT_TOKENS = 150;
const estimatedInputTokens = (inputString = "") => {
  return Math.round(inputString?.length * 1.5 || 0);
};

export const ChatInput = () => {
  const { sendMessage, status, defaultConversationId, messages } =
    useChatMessageContext();
  const { selectedModelId } = useChatModelContext();
  const [userInput, setUserInput] = useState("");

  const estimatedInputTokensValue = estimatedInputTokens(userInput);

  const isAboveMaxTokens = estimatedInputTokensValue > MAX_INPUT_TOKENS;
  // Send Button Icon
  const SendButtonIcon = () => {
    if (status === "streaming") {
      return <HugeiconsIcon icon={Loading03Icon} size={20} strokeWidth={2} />;
    }
    return <HugeiconsIcon icon={Navigation03Icon} size={20} strokeWidth={2} />;
  };

  const handleSendMessage = (isSmartContext = false, contextWindow = 4) => {
    sendMessage({
      text: userInput,
      metadata: {
        conversationId: defaultConversationId,
        model: selectedModelId,
        isSmartContext: isSmartContext,
        contextWindow: contextWindow,
      },
    });
    setUserInput("");
  };

  return (
    <div className="flex flex-col gap-2">
      <ChatSuggestionClient setUserInput={setUserInput} />
      <InputGroup className="w-[80vw]">
        <InputGroupTextarea
          placeholder="Ask, Search, or Chat With Your Agent..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (status !== "streaming") {
                handleSendMessage();
              }
            }
          }}
        />

        {/* Chat Input Addons -- Might Need to be a separate component */}
        <InputGroupAddon align="block-end" className="pb-0 pt-0">
          <InputGroupButton
            variant="outline"
            className={`rounded-none ${
              isAboveMaxTokens ? "border-destructive/60 border-2" : ""
            }`}
            size="icon-sm"
          >
            <InputContextRadicalCircle
              tokenValue={estimatedInputTokensValue}
              maxTokens={MAX_INPUT_TOKENS}
            />
          </InputGroupButton>
          <InputGroupButton
            variant="outline"
            className="rounded-none"
            size="icon-sm"
            disabled={status === "streaming" || userInput.trim() === ""}
            onClick={() => {
              handleSendMessage();
            }}
          >
            <SendButtonIcon />
          </InputGroupButton>

          <InputGroupAddon align="block-start">
            {messages.length > 0 && <ChatContextPopup />}
            <AIModelSelector />
            <ChatHistoryPopup />
          </InputGroupAddon>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

const InputContextRadicalCircle = ({ tokenValue = 0, maxTokens = 0 }) => {
  const data = [
    {
      name: "inputTokens",
      value: tokenValue,
      fill: "var(--muted-foreground)",
    },
  ];
  const config = {
    inputTokens: { label: "Input Tokens", color: "#8884d8" },
  };
  return (
    <ChartContainer config={config} className="h-8 w-8 aspect-square">
      <RadialBarChart
        data={data}
        startAngle={0}
        endAngle={360}
        innerRadius={8}
        outerRadius={14}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, maxTokens]}
          dataKey="value"
          tick={false}
        />
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          polarRadius={[10]}
        />
        <RadialBar dataKey="value" background cornerRadius={10} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} />
      </RadialBarChart>
    </ChartContainer>
  );
};
