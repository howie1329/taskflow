"use client";
import React, { useMemo } from 'react';
import { useChatContext } from "./ChatContextProvider";

// Note: Install reactflow first: npm install reactflow
// import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
// import 'reactflow/dist/style.css';

/**
 * Network Graph Visualization for Context Management
 * 
 * To use this component:
 * 1. Install reactflow: npm install reactflow
 * 2. Uncomment the imports above
 * 3. Uncomment the component code below
 * 
 * This shows relationships between context sources as an interactive network graph
 */
export const ContextNetworkGraph = () => {
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

  // Uncomment when reactflow is installed:
  /*
  const nodes = useMemo(() => [
    {
      id: 'system-prompt',
      type: 'input',
      data: { 
        label: 'System Prompt', 
        tokens: systemPromptTokens ?? 0,
        percent: ((systemPromptTokens ?? 0) / maxTokens * 100).toFixed(1) + '%'
      },
      position: { x: 0, y: 100 },
      style: { 
        background: '#22c55e', 
        color: '#fff', 
        width: 150,
        borderRadius: '8px',
        border: '2px solid #16a34a',
        padding: '10px',
      },
    },
    {
      id: 'recent-chats',
      data: { 
        label: 'Recent Chats', 
        tokens: recentChatsTokens ?? 0,
        percent: ((recentChatsTokens ?? 0) / maxTokens * 100).toFixed(1) + '%'
      },
      position: { x: 200, y: 0 },
      style: { 
        background: '#ef4444', 
        color: '#fff', 
        width: 150,
        borderRadius: '8px',
        border: '2px solid #dc2626',
        padding: '10px',
      },
    },
    {
      id: 'current-chat',
      data: { 
        label: 'Current Chat', 
        tokens: currentChatTokens ?? 0,
        percent: ((currentChatTokens ?? 0) / maxTokens * 100).toFixed(1) + '%'
      },
      position: { x: 400, y: 100 },
      style: { 
        background: '#3b82f6', 
        color: '#fff', 
        width: 150,
        borderRadius: '8px',
        border: '2px solid #2563eb',
        padding: '10px',
      },
    },
    {
      id: 'user-info',
      data: { 
        label: 'User Info', 
        tokens: userInfoTokens ?? 0,
        percent: ((userInfoTokens ?? 0) / maxTokens * 100).toFixed(1) + '%'
      },
      position: { x: 100, y: 250 },
      style: { 
        background: '#eab308', 
        color: '#fff', 
        width: 150,
        borderRadius: '8px',
        border: '2px solid #ca8a04',
        padding: '10px',
      },
    },
    {
      id: 'session-info',
      data: { 
        label: 'Session Info', 
        tokens: sessionInfoTokens ?? 0,
        percent: ((sessionInfoTokens ?? 0) / maxTokens * 100).toFixed(1) + '%'
      },
      position: { x: 300, y: 250 },
      style: { 
        background: '#a855f7', 
        color: '#fff', 
        width: 150,
        borderRadius: '8px',
        border: '2px solid #9333ea',
        padding: '10px',
      },
    },
    {
      id: 'context-window',
      type: 'output',
      data: { 
        label: 'AI Context Window', 
        tokens: totalTokens,
        percent: ((totalTokens / maxTokens) * 100).toFixed(1) + '%',
        maxTokens: maxTokens
      },
      position: { x: 200, y: 400 },
      style: { 
        background: '#6366f1', 
        color: '#fff', 
        width: 200,
        borderRadius: '12px',
        border: '3px solid #4f46e5',
        padding: '15px',
        fontSize: '16px',
        fontWeight: 'bold',
      },
    },
  ], [systemPromptTokens, recentChatsTokens, currentChatTokens, userInfoTokens, sessionInfoTokens, totalTokens, maxTokens]);

  const edges = useMemo(() => [
    { 
      id: 'e-system-context', 
      source: 'system-prompt', 
      target: 'context-window', 
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 2 }
    },
    { 
      id: 'e-recent-context', 
      source: 'recent-chats', 
      target: 'context-window', 
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 2 }
    },
    { 
      id: 'e-current-context', 
      source: 'current-chat', 
      target: 'context-window', 
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 }
    },
    { 
      id: 'e-user-context', 
      source: 'user-info', 
      target: 'context-window', 
      animated: true,
      style: { stroke: '#eab308', strokeWidth: 2 }
    },
    { 
      id: 'e-session-context', 
      source: 'session-info', 
      target: 'context-window', 
      animated: true,
      style: { stroke: '#a855f7', strokeWidth: 2 }
    },
  ], []);

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => node.style?.background || '#fff'}
          style={{ backgroundColor: 'hsl(var(--background))' }}
        />
      </ReactFlow>
    </div>
  );
  */

  // Placeholder until reactflow is installed:
  return (
    <div className="flex items-center justify-center h-[600px] border border-dashed rounded-lg">
      <div className="text-center text-muted-foreground">
        <p className="text-lg font-semibold mb-2">Network Graph Visualization</p>
        <p className="text-sm mb-4">Install reactflow to enable this visualization:</p>
        <code className="bg-muted px-2 py-1 rounded text-xs">npm install reactflow</code>
        <p className="text-xs mt-4">Then uncomment the code in ContextNetworkGraph.js</p>
      </div>
    </div>
  );
};
