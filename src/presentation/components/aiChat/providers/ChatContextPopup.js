"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useChatContext } from "./ChatContextProvider";
import { Popover } from "@/components/ui/popover";
import { PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartIcon } from "@hugeicons/core-free-icons/index";

export const ChatContextPopup = () => {
  const {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
  } = useChatContext();

  const chartData = [
    {
      name: "Tokens",
      systemPromptTokens: systemPromptTokens ?? 0,
      recentChatsTokens: recentChatsTokens ?? 0,
      currentChatTokens: currentChatTokens ?? 0,
      userInfoTokens: userInfoTokens ?? 0,
      sessionInfoTokens: sessionInfoTokens ?? 0,
      maxTokens: 1000,
    },
  ];

  const chartConfig = {
    systemPromptTokens: { label: "System Prompt Tokens", color: "#22c55e" },
    recentChatsTokens: { label: "Recent Chats Tokens", color: "#ef4444" },
    currentChatTokens: { label: "Current Chat Tokens", color: "#3b82f6" },
    userInfoTokens: { label: "User Info Tokens", color: "#eab308" },
    sessionInfoTokens: { label: "Session Info Tokens", color: "#a855f7" },
    maxTokens: { label: "Max Tokens", color: "#000000" },
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="icon">
          <HugeiconsIcon icon={ChartIcon} size={20} strokeWidth={2} />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-[360px] p-3">
        <div className="flex flex-col gap-2">
          <ChatContextChart chartConfig={chartConfig} chartData={chartData} />
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <p className="text-muted-foreground">System Prompt</p>
            <p className="text-right font-mono tabular-nums">
              {systemPromptTokens ?? 0}
            </p>
            <p className="text-muted-foreground">Recent Chats</p>
            <p className="text-right font-mono tabular-nums">
              {recentChatsTokens ?? 0}
            </p>
            <p className="text-muted-foreground">Current Chat</p>
            <p className="text-right font-mono tabular-nums">
              {currentChatTokens ?? 0}
            </p>
            <p className="text-muted-foreground">User Info</p>
            <p className="text-right font-mono tabular-nums">
              {userInfoTokens ?? 0}
            </p>
            <p className="text-muted-foreground">Session Info</p>
            <p className="text-right font-mono tabular-nums">
              {sessionInfoTokens ?? 0}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ChatContextChart = ({ chartConfig, chartData }) => {
  return (
    <ChartContainer config={chartConfig} className="h-10 w-[320px] aspect-auto">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        barSize={16}
      >
        <CartesianGrid vertical={false} horizontal={false} />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" hide />

        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

        <Bar
          dataKey="systemPromptTokens"
          stackId="tokens"
          fill={chartConfig.systemPromptTokens.color}
          radius={[8, 0, 0, 8]}
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
        <Bar
          dataKey="recentChatsTokens"
          stackId="tokens"
          fill={chartConfig.recentChatsTokens.color}
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
        <Bar
          dataKey="currentChatTokens"
          stackId="tokens"
          fill={chartConfig.currentChatTokens.color}
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
        <Bar
          dataKey="userInfoTokens"
          stackId="tokens"
          fill={chartConfig.userInfoTokens.color}
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
        <Bar
          dataKey="sessionInfoTokens"
          stackId="tokens"
          fill={chartConfig.sessionInfoTokens.color}
          radius={[0, 8, 8, 0]}
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
      </BarChart>
    </ChartContainer>
  );
};
