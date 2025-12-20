"use client";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useEffect, useState } from "react";
import { useChatMessageContext } from "./ChatMessageProvider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp02Icon,
  StopCircleIcon,
} from "@hugeicons/core-free-icons/index";
import { AIModelSelector } from "../AIModelSelector";
import { useChatModelContext } from "./ChatModelProvider";
import { ChatHistoryPopup } from "./ChatHistoryPopup";
import { ChatSuggestionClient } from "./ChatSuggestionClient";
import { ChatContextPopup } from "./ChatContextPopup";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { AnimatePresence, motion } from "motion/react";

const MAX_INPUT_TOKENS = 150;
const estimatedInputTokens = (inputString = "") => {
  return Math.round(inputString?.length * 1.5 || 0);
};

export const ChatInput = () => {
  const { sendMessage, status, defaultConversationId, messages, stop } =
    useChatMessageContext();
  const { selectedModelId } = useChatModelContext();
  const [userInput, setUserInput] = useState("");
  const [debouncedHoveredOverInput, setDebouncedHoveredOverInput] =
    useState(false);
  const [hoveredOverInput, setHoveredOverInput] = useState(false);

  const estimatedInputTokensValue = estimatedInputTokens(userInput);

  const isAboveMaxTokens = estimatedInputTokensValue > MAX_INPUT_TOKENS;
  // Send Button Icon
  const SendButtonIcon = () => {
    if (status === "streaming") {
      return <HugeiconsIcon icon={StopCircleIcon} size={20} strokeWidth={2} />;
    }
    return <HugeiconsIcon icon={ArrowUp02Icon} size={20} strokeWidth={3} />;
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHoveredOverInput(hoveredOverInput);
    }, 1000);
    return () => clearTimeout(timer);
  }, [hoveredOverInput]);

  useEffect(() => {
    if (userInput.trim() !== "") {
      setHoveredOverInput(true);
    }
  }, [userInput, hoveredOverInput]);

  return (
    <div className="flex flex-col items-center justify-center gap-1 lg:gap-2 w-full">
      <AnimatePresence>
        {debouncedHoveredOverInput && (
          <motion.div
            key="chat-suggestion-client"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.2, ease: "backInOut" }}
          >
            <ChatSuggestionClient setUserInput={setUserInput} />
          </motion.div>
        )}
      </AnimatePresence>
      <InputGroup
        className="w-full lg:w-[80vw] "
        onFocus={() => setHoveredOverInput(true)}
        onBlur={() => setHoveredOverInput(false)}
      >
        <InputGroupTextarea
          className="w-full"
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
          {status === "streaming" ? (
            <InputGroupButton
              variant="outline"
              className="rounded-none"
              size="icon-sm"
              onClick={() => {
                stop();
              }}
            >
              <SendButtonIcon />
            </InputGroupButton>
          ) : (
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
          )}

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
