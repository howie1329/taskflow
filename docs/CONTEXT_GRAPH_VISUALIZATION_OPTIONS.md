# Context Management Graph Visualization Options

This document outlines various approaches to visualize context management in your AI chat system. You currently have a horizontal stacked bar chart showing token usage. Here are additional visualization options:

## 1. **Network/Node Graph** (Relationship Visualization)

Shows relationships between different context sources and how they connect.

### Libraries:
- **react-flow** (Recommended) - Modern, React-friendly, highly customizable
- **vis-network** - Mature, feature-rich
- **cytoscape.js** - Powerful, scientific-grade
- **d3.js** - Maximum flexibility, steeper learning curve

### Example with react-flow:

```bash
npm install reactflow
```

```jsx
"use client";
import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useChatContext } from "./ChatContextProvider";

const ContextNetworkGraph = () => {
  const {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
  } = useChatContext();

  const nodes = useMemo(() => [
    {
      id: '1',
      type: 'input',
      data: { label: 'System Prompt', tokens: systemPromptTokens },
      position: { x: 0, y: 0 },
      style: { background: '#22c55e', color: '#fff', width: 150 },
    },
    {
      id: '2',
      data: { label: 'Recent Chats', tokens: recentChatsTokens },
      position: { x: 200, y: 0 },
      style: { background: '#ef4444', color: '#fff', width: 150 },
    },
    {
      id: '3',
      data: { label: 'Current Chat', tokens: currentChatTokens },
      position: { x: 400, y: 0 },
      style: { background: '#3b82f6', color: '#fff', width: 150 },
    },
    {
      id: '4',
      data: { label: 'User Info', tokens: userInfoTokens },
      position: { x: 100, y: 150 },
      style: { background: '#eab308', color: '#fff', width: 150 },
    },
    {
      id: '5',
      data: { label: 'Session Info', tokens: sessionInfoTokens },
      position: { x: 300, y: 150 },
      style: { background: '#a855f7', color: '#fff', width: 150 },
    },
    {
      id: '6',
      type: 'output',
      data: { label: 'AI Context Window', tokens: systemPromptTokens + recentChatsTokens + currentChatTokens + userInfoTokens + sessionInfoTokens },
      position: { x: 200, y: 300 },
      style: { background: '#6366f1', color: '#fff', width: 200 },
    },
  ], [systemPromptTokens, recentChatsTokens, currentChatTokens, userInfoTokens, sessionInfoTokens]);

  const edges = useMemo(() => [
    { id: 'e1-6', source: '1', target: '6', animated: true },
    { id: 'e2-6', source: '2', target: '6', animated: true },
    { id: 'e3-6', source: '3', target: '6', animated: true },
    { id: 'e4-6', source: '4', target: '6', animated: true },
    { id: 'e5-6', source: '5', target: '6', animated: true },
  ], []);

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
```

---

## 2. **Sankey Diagram** (Flow Visualization)

Shows the flow of tokens from sources to the context window. Great for showing proportions.

### Using Recharts (already installed):

```jsx
"use client";
import { Sankey, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useChatContext } from "./ChatContextProvider";

const ContextSankeyChart = () => {
  const {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
  } = useChatContext();

  const data = {
    nodes: [
      { name: 'System Prompt' },
      { name: 'Recent Chats' },
      { name: 'Current Chat' },
      { name: 'User Info' },
      { name: 'Session Info' },
      { name: 'Context Window' },
    ],
    links: [
      { source: 0, target: 5, value: systemPromptTokens },
      { source: 1, target: 5, value: recentChatsTokens },
      { source: 2, target: 5, value: currentChatTokens },
      { source: 3, target: 5, value: userInfoTokens },
      { source: 4, target: 5, value: sessionInfoTokens },
    ],
  };

  return (
    <ChartContainer config={{}} className="h-[400px] w-full">
      <Sankey
        data={data}
        nodePadding={50}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        link={{ stroke: '#8884d8' }}
      >
        <Tooltip />
      </Sankey>
    </ChartContainer>
  );
};
```

**Note:** Recharts doesn't have native Sankey support. Consider:
- **@visx/sankey** (visx library)
- **plotly.js** (has Sankey)
- **d3-sankey** (d3 plugin)

---

## 3. **Sunburst Chart** (Hierarchical Breakdown)

Shows nested context breakdown in a circular format.

### Using Recharts:

```jsx
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useChatContext } from "./ChatContextProvider";

const ContextSunburstChart = () => {
  const {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
  } = useChatContext();

  const data = [
    { name: 'System Prompt', value: systemPromptTokens, color: '#22c55e' },
    { name: 'Recent Chats', value: recentChatsTokens, color: '#ef4444' },
    { name: 'Current Chat', value: currentChatTokens, color: '#3b82f6' },
    { name: 'User Info', value: userInfoTokens, color: '#eab308' },
    { name: 'Session Info', value: sessionInfoTokens, color: '#a855f7' },
  ];

  return (
    <ChartContainer config={{}} className="h-[400px] w-full">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartContainer>
  );
};
```

---

## 4. **Tree Diagram** (Hierarchical Structure)

Shows context hierarchy in a tree format.

### Using react-d3-tree or @visx/hierarchy:

```bash
npm install react-d3-tree
```

```jsx
"use client";
import Tree from 'react-d3-tree';
import { useChatContext } from "./ChatContextProvider";

const ContextTreeDiagram = () => {
  const {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
  } = useChatContext();

  const orgChart = {
    name: 'AI Context Window',
    attributes: {
      totalTokens: systemPromptTokens + recentChatsTokens + currentChatTokens + userInfoTokens + sessionInfoTokens,
    },
    children: [
      {
        name: 'System Prompt',
        attributes: { tokens: systemPromptTokens },
      },
      {
        name: 'Recent Chats',
        attributes: { tokens: recentChatsTokens },
      },
      {
        name: 'Current Chat',
        attributes: { tokens: currentChatTokens },
      },
      {
        name: 'User Info',
        attributes: { tokens: userInfoTokens },
      },
      {
        name: 'Session Info',
        attributes: { tokens: sessionInfoTokens },
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Tree
        data={orgChart}
        orientation="vertical"
        pathFunc="step"
        nodeSize={{ x: 200, y: 100 }}
        translate={{ x: 400, y: 50 }}
      />
    </div>
  );
};
```

---

## 5. **Force-Directed Graph** (Interactive Relationships)

Shows context sources as nodes with force-directed layout.

### Using vis-network:

```bash
npm install vis-network
```

```jsx
"use client";
import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { useChatContext } from "./ChatContextProvider";

const ContextForceGraph = () => {
  const containerRef = useRef(null);
  const {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
  } = useChatContext();

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = [
      { id: 1, label: 'System Prompt', value: systemPromptTokens, color: '#22c55e' },
      { id: 2, label: 'Recent Chats', value: recentChatsTokens, color: '#ef4444' },
      { id: 3, label: 'Current Chat', value: currentChatTokens, color: '#3b82f6' },
      { id: 4, label: 'User Info', value: userInfoTokens, color: '#eab308' },
      { id: 5, label: 'Session Info', value: sessionInfoTokens, color: '#a855f7' },
      { id: 6, label: 'Context Window', value: systemPromptTokens + recentChatsTokens + currentChatTokens + userInfoTokens + sessionInfoTokens, color: '#6366f1', size: 50 },
    ];

    const edges = [
      { from: 1, to: 6 },
      { from: 2, to: 6 },
      { from: 3, to: 6 },
      { from: 4, to: 6 },
      { from: 5, to: 6 },
    ];

    const data = { nodes, edges };
    const options = {
      physics: {
        enabled: true,
        stabilization: { iterations: 200 },
      },
      nodes: {
        shape: 'dot',
        scaling: {
          min: 10,
          max: 50,
        },
      },
    };

    const network = new Network(containerRef.current, data, options);

    return () => {
      network.destroy();
    };
  }, [systemPromptTokens, recentChatsTokens, currentChatTokens, userInfoTokens, sessionInfoTokens]);

  return <div ref={containerRefRef} style={{ width: '100%', height: '500px' }} />;
};
```

---

## 6. **Radial/Donut Chart** (Circular Breakdown)

Similar to sunburst but simpler - shows proportions in a donut format.

### Using Recharts (already installed):

```jsx
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useChatContext } from "./ChatContextProvider";

const ContextDonutChart = () => {
  const {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
  } = useChatContext();

  const data = [
    { name: 'System Prompt', value: systemPromptTokens, color: '#22c55e' },
    { name: 'Recent Chats', value: recentChatsTokens, color: '#ef4444' },
    { name: 'Current Chat', value: currentChatTokens, color: '#3b82f6' },
    { name: 'User Info', value: userInfoTokens, color: '#eab308' },
    { name: 'Session Info', value: sessionInfoTokens, color: '#a855f7' },
  ];

  const chartConfig = {
    systemPrompt: { label: 'System Prompt', color: '#22c55e' },
    recentChats: { label: 'Recent Chats', color: '#ef4444' },
    currentChat: { label: 'Current Chat', color: '#3b82f6' },
    userInfo: { label: 'User Info', color: '#eab308' },
    sessionInfo: { label: 'Session Info', color: '#a855f7' },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
      </PieChart>
    </ChartContainer>
  );
};
```

---

## 7. **Treemap** (Area-based Hierarchy)

Shows context breakdown where size represents token count.

### Using Recharts:

```jsx
"use client";
import { Treemap, Tooltip } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";
import { useChatContext } from "./ChatContextProvider";

const ContextTreemap = () => {
  const {
    systemPromptTokens,
    recentChatsTokens,
    currentChatTokens,
    userInfoTokens,
    sessionInfoTokens,
  } = useChatContext();

  const data = [
    { name: 'System Prompt', size: systemPromptTokens, fill: '#22c55e' },
    { name: 'Recent Chats', size: recentChatsTokens, fill: '#ef4444' },
    { name: 'Current Chat', size: currentChatTokens, fill: '#3b82f6' },
    { name: 'User Info', size: userInfoTokens, fill: '#eab308' },
    { name: 'Session Info', size: sessionInfoTokens, fill: '#a855f7' },
  ];

  return (
    <ChartContainer config={{}} className="h-[400px] w-full">
      <Treemap
        width={400}
        height={300}
        data={data}
        dataKey="size"
        ratio={4/3}
        stroke="#fff"
        fill="#8884d8"
      >
        <Tooltip />
      </Treemap>
    </ChartContainer>
  );
};
```

---

## Recommendation Summary

**For your use case (context management visualization):**

1. **Best for relationships**: **react-flow** - Modern, React-friendly, great for showing how context sources connect
2. **Best for proportions**: **Donut/Pie Chart** (Recharts) - Already installed, easy to implement
3. **Best for flow**: **Sankey Diagram** - Shows token flow from sources to context window
4. **Best for hierarchy**: **Tree Diagram** - Shows nested context structure
5. **Best for interactivity**: **Force-Directed Graph** - Interactive exploration

**Quick Win**: Start with the **Donut Chart** using Recharts (already installed) - it's the easiest to implement and provides good visual feedback.

**Most Impressive**: **react-flow** network graph - shows relationships clearly and is highly interactive.

---

## Implementation Priority

1. ✅ **Current**: Horizontal stacked bar chart (already implemented)
2. 🎯 **Next**: Donut chart (quick, uses existing Recharts)
3. 🎯 **Then**: Network graph with react-flow (most informative)
4. 🎯 **Future**: Sankey diagram (if you want flow visualization)
