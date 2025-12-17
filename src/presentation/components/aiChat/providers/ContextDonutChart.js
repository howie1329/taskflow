"use client";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useChatContext } from "./ChatContextProvider";

export const ContextDonutChart = () => {
  const {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
  } = useChatContext();

  const maxTokens = 4000;
  const totalTokens =
    (systemPromptTokens ?? 0) +
    (recentChatsTokens ?? 0) +
    (currentChatTokens ?? 0) +
    (userInfoTokens ?? 0) +
    (sessionInfoTokens ?? 0);
  const remainingTokens = Math.max(0, maxTokens - totalTokens);

  const data = [
    { 
      name: 'System Prompt', 
      value: systemPromptTokens ?? 0, 
      color: '#22c55e',
      label: 'System Prompt'
    },
    { 
      name: 'Recent Chats', 
      value: recentChatsTokens ?? 0, 
      color: '#ef4444',
      label: 'Recent Chats'
    },
    { 
      name: 'Current Chat', 
      value: currentChatTokens ?? 0, 
      color: '#3b82f6',
      label: 'Current Chat'
    },
    { 
      name: 'User Info', 
      value: userInfoTokens ?? 0, 
      color: '#eab308',
      label: 'User Info'
    },
    { 
      name: 'Session Info', 
      value: sessionInfoTokens ?? 0, 
      color: '#a855f7',
      label: 'Session Info'
    },
    ...(remainingTokens > 0 ? [{
      name: 'Remaining',
      value: remainingTokens,
      color: 'hsl(var(--muted))',
      label: 'Remaining'
    }] : [])
  ].filter(item => item.value > 0); // Only show segments with values

  const chartConfig = {
    systemPrompt: { label: 'System Prompt', color: '#22c55e' },
    recentChats: { label: 'Recent Chats', color: '#ef4444' },
    currentChat: { label: 'Current Chat', color: '#3b82f6' },
    userInfo: { label: 'User Info', color: '#eab308' },
    sessionInfo: { label: 'Session Info', color: '#a855f7' },
    remaining: { label: 'Remaining', color: 'hsl(var(--muted))' },
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = ((data.value / maxTokens) * 100).toFixed(1);
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: data.payload.fill }}
              />
              <span className="text-sm font-medium">{data.name}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{data.value.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">tokens</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {percent}% of max context
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => 
            percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => (
            <span style={{ color: entry.color, fontSize: '12px' }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ChartContainer>
  );
};
