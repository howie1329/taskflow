# Context Graph Visualization Integration Guide

## Quick Start

You already have `ChatContextPopup.js` with a horizontal bar chart. Here are ways to enhance it with different graph visualizations.

## Option 1: Add Donut Chart (Easiest - Uses Existing Recharts)

Update `ChatContextPopup.js` to include a button toggle between bar chart and donut chart:

```jsx
"use client";
import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useChatContext } from "./ChatContextProvider";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartIcon } from "@hugeicons/core-free-icons/index";
import { ContextDonutChart } from "./ContextDonutChart";
import { ChatContextChart } from "./ChatContextPopup"; // Your existing chart component

export const ChatContextPopup = () => {
  const [viewMode, setViewMode] = useState("bar"); // "bar" or "donut"
  
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

  const chartData = [
    {
      name: "Tokens",
      systemPromptTokens: systemPromptTokens ?? 0,
      recentChatsTokens: recentChatsTokens ?? 0,
      currentChatTokens: currentChatTokens ?? 0,
      userInfoTokens: userInfoTokens ?? 0,
      sessionInfoTokens: sessionInfoTokens ?? 0,
      remainingTokens,
    },
  ];

  const chartConfig = {
    systemPromptTokens: { label: "System Prompt Tokens", color: "#22c55e" },
    recentChatsTokens: { label: "Recent Chats Tokens", color: "#ef4444" },
    currentChatTokens: { label: "Current Chat Tokens", color: "#3b82f6" },
    userInfoTokens: { label: "User Info Tokens", color: "#eab308" },
    sessionInfoTokens: { label: "Session Info Tokens", color: "#a855f7" },
    remainingTokens: { label: "Remaining", color: "hsl(var(--muted))" },
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="icon">
          <HugeiconsIcon icon={ChartIcon} size={20} strokeWidth={2} />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-[400px] p-3">
        <div className="flex flex-col gap-3">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("bar")}
              className="flex-1"
            >
              Bar Chart
            </Button>
            <Button
              variant={viewMode === "donut" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("donut")}
              className="flex-1"
            >
              Donut Chart
            </Button>
          </div>

          {/* Chart Display */}
          {viewMode === "bar" ? (
            <>
              <ChatContextChart
                chartConfig={chartConfig}
                chartData={chartData}
                maxTokens={maxTokens}
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                {/* ... existing token breakdown ... */}
              </div>
            </>
          ) : (
            <>
              <ContextDonutChart />
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                {/* ... existing token breakdown ... */}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
```

## Option 2: Add Network Graph (Most Impressive)

1. **Install reactflow:**
   ```bash
   npm install reactflow
   ```

2. **Update ChatContextPopup.js to add network view:**
   ```jsx
   import { ContextNetworkGraph } from "./ContextNetworkGraph";
   
   // Add to viewMode state options: "bar" | "donut" | "network"
   // Add button for network view:
   <Button
     variant={viewMode === "network" ? "default" : "outline"}
     size="sm"
     onClick={() => setViewMode("network")}
     className="flex-1"
   >
     Network
   </Button>
   
   // Add to conditional rendering:
   {viewMode === "network" && (
     <div className="h-[400px]">
       <ContextNetworkGraph />
     </div>
   )}
   ```

3. **Uncomment the code in `ContextNetworkGraph.js`** (remove the placeholder)

## Option 3: Create a Dedicated Context Visualization Page

Create a full-page context visualization using buttons for view switching:

```jsx
// src/app/mainview/aichat/[id]/context/page.js
"use client";
import { useState } from "react";
import { ContextDonutChart } from "@/presentation/components/aiChat/providers/ContextDonutChart";
import { ContextNetworkGraph } from "@/presentation/components/aiChat/providers/ContextNetworkGraph";
import { ChatContextProvider } from "@/presentation/components/aiChat/providers/ChatContextProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ContextVisualizationPage() {
  const [viewMode, setViewMode] = useState("donut");

  return (
    <ChatContextProvider>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Context Management Visualization</h1>
        
        {/* View Mode Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === "donut" ? "default" : "outline"}
            onClick={() => setViewMode("donut")}
          >
            Donut Chart
          </Button>
          <Button
            variant={viewMode === "network" ? "default" : "outline"}
            onClick={() => setViewMode("network")}
          >
            Network Graph
          </Button>
          <Button
            variant={viewMode === "bar" ? "default" : "outline"}
            onClick={() => setViewMode("bar")}
          >
            Bar Chart
          </Button>
        </div>

        {/* Visualization Display */}
        <Card className="p-6">
          {viewMode === "donut" && <ContextDonutChart />}
          {viewMode === "network" && <ContextNetworkGraph />}
          {viewMode === "bar" && (
            <div className="text-center text-muted-foreground">
              Bar chart visualization (use your existing ChatContextChart component)
            </div>
          )}
        </Card>
      </div>
    </ChatContextProvider>
  );
}
```

## Comparison of Visualization Types

| Type | Best For | Complexity | Interactivity |
|------|----------|------------|---------------|
| **Bar Chart** (current) | Quick token breakdown | Low | Low |
| **Donut Chart** | Proportional view | Low | Medium |
| **Network Graph** | Relationships & flow | Medium | High |
| **Sankey Diagram** | Flow visualization | High | Medium |
| **Tree Diagram** | Hierarchy | Medium | Medium |
| **Treemap** | Area comparison | Low | Low |

## Recommended Implementation Order

1. ✅ **Done**: Horizontal bar chart
2. 🎯 **Next**: Add donut chart (5 minutes, uses existing Recharts)
3. 🎯 **Then**: Add network graph (15 minutes, requires reactflow install)
4. 🎯 **Future**: Sankey diagram if you want flow visualization

## Files Created

- `docs/CONTEXT_GRAPH_VISUALIZATION_OPTIONS.md` - Comprehensive guide with all options
- `src/presentation/components/aiChat/providers/ContextDonutChart.js` - Ready-to-use donut chart
- `src/presentation/components/aiChat/providers/ContextNetworkGraph.js` - Network graph (needs reactflow)

## Next Steps

1. Try the donut chart first - it's already implemented and uses your existing Recharts setup
2. If you like it, integrate it into `ChatContextPopup.js` with tabs
3. For the network graph, install reactflow and uncomment the code in `ContextNetworkGraph.js`
