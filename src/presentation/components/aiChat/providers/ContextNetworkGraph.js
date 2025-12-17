"use client";
import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useChatContext } from "./ChatContextProvider";

// Custom node component to match the screenshot style
const ContextNode = ({ data }) => {
  return (
    <div
      style={{
        background: data.color,
        color: '#fff',
        padding: data.isMain ? '14px 18px' : '10px 14px',
        borderRadius: '8px',
        border: `2px solid ${data.borderColor}`,
        minWidth: data.isMain ? '180px' : '140px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        fontWeight: data.isMain ? '600' : '500',
        fontSize: data.isMain ? '15px' : '13px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
      }}
    >
      <div style={{ marginBottom: '6px', fontWeight: data.isMain ? '600' : '500' }}>
        {data.label}
      </div>
      <div style={{ fontSize: '11px', opacity: 0.95, fontWeight: '400' }}>
        {data.tokens.toLocaleString()} tokens
      </div>
    </div>
  );
};

const nodeTypes = {
  contextNode: ContextNode,
};

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

  const nodes = useMemo(() => [
    {
      id: 'system-prompt',
      type: 'contextNode',
      data: { 
        label: 'System Prompt', 
        tokens: systemPromptTokens ?? 0,
        color: '#22c55e',
        borderColor: '#16a34a',
        isMain: false,
      },
      position: { x: 80, y: 80 },
    },
    {
      id: 'recent-chats',
      type: 'contextNode',
      data: { 
        label: 'Recent Chats', 
        tokens: recentChatsTokens ?? 0,
        color: '#ef4444',
        borderColor: '#dc2626',
        isMain: false,
      },
      position: { x: 480, y: 80 },
    },
    {
      id: 'current-chat',
      type: 'contextNode',
      data: { 
        label: 'Current Chat', 
        tokens: currentChatTokens ?? 0,
        color: '#3b82f6',
        borderColor: '#2563eb',
        isMain: false,
      },
      position: { x: 280, y: 80 },
    },
    {
      id: 'user-info',
      type: 'contextNode',
      data: { 
        label: 'User Info', 
        tokens: userInfoTokens ?? 0,
        color: '#eab308',
        borderColor: '#ca8a04',
        isMain: false,
      },
      position: { x: 80, y: 280 },
    },
    {
      id: 'session-info',
      type: 'contextNode',
      data: { 
        label: 'Session Info', 
        tokens: sessionInfoTokens ?? 0,
        color: '#a855f7',
        borderColor: '#9333ea',
        isMain: false,
      },
      position: { x: 480, y: 280 },
    },
    {
      id: 'context-window',
      type: 'contextNode',
      data: { 
        label: 'AI Context Window', 
        tokens: totalTokens,
        color: '#6366f1',
        borderColor: '#4f46e5',
        isMain: true,
      },
      position: { x: 240, y: 480 },
    },
  ], [systemPromptTokens, recentChatsTokens, currentChatTokens, userInfoTokens, sessionInfoTokens, totalTokens]);

  const edges = useMemo(() => [
    { 
      id: 'e-system-context', 
      source: 'system-prompt', 
      target: 'context-window', 
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#22c55e',
      },
    },
    { 
      id: 'e-recent-context', 
      source: 'recent-chats', 
      target: 'context-window', 
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#ef4444',
      },
    },
    { 
      id: 'e-current-context', 
      source: 'current-chat', 
      target: 'context-window', 
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
      },
    },
    { 
      id: 'e-user-context', 
      source: 'user-info', 
      target: 'context-window', 
      animated: true,
      style: { stroke: '#eab308', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#eab308',
      },
    },
    { 
      id: 'e-session-context', 
      source: 'session-info', 
      target: 'context-window', 
      animated: true,
      style: { stroke: '#a855f7', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#a855f7',
      },
    },
  ], []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', minHeight: '600px' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.1 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background 
          color="hsl(var(--muted))" 
          gap={20}
          size={1}
          variant="dots"
        />
        <Controls 
          showInteractive={false}
          style={{
            button: {
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              width: '32px',
              height: '32px',
            },
          }}
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data?.color) {
              return node.data.color;
            }
            return 'hsl(var(--muted))';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '4px',
          }}
          pannable
          zoomable
          nodeStrokeWidth={2}
        />
      </ReactFlow>
    </div>
  );
};
