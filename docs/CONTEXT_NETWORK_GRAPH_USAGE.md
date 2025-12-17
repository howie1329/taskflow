# Context Network Graph - Usage Guide

## Overview

A network graph visualization that matches the screenshot, showing how different context sources flow into the AI Context Window.

## Quick Start

### Option 1: Use as a Dialog (Recommended)

The easiest way is to use the `ContextGraphView` component which opens in a dialog:

```jsx
import { ContextGraphView } from "@/presentation/components/aiChat/ContextGraphView";

// In your component:
<ContextGraphView asDialog={true} />
```

This will show a button that opens the graph in a dialog when clicked.

### Option 2: Use Directly in a Page

```jsx
import { ContextNetworkGraph } from "@/presentation/components/aiChat/providers/ContextNetworkGraph";
import { ChatContextProvider } from "@/presentation/components/aiChat/providers/ChatContextProvider";

// In your page component:
<ChatContextProvider>
  <div className="w-full h-[600px]">
    <ContextNetworkGraph />
  </div>
</ChatContextProvider>
```

### Option 3: Add to Existing ChatContextPopup

You can add a button to switch between bar chart and network graph views:

```jsx
// In ChatContextPopup.js
import { useState } from "react";
import { ContextNetworkGraph } from "./ContextNetworkGraph";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export const ChatContextPopup = () => {
  const [showGraph, setShowGraph] = useState(false);
  
  // ... existing code ...

  return (
    <>
      <Popover>
        {/* Existing popover code */}
      </Popover>
      
      {/* Network Graph Dialog */}
      <Dialog open={showGraph} onOpenChange={setShowGraph}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2">
            View Graph
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0">
          <div className="p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Context Management Graph</h2>
            <div className="flex-1 min-h-0">
              <ChatContextProvider>
                <ContextNetworkGraph />
              </ChatContextProvider>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
```

## Features

- **Interactive Nodes**: Click and drag nodes to reposition
- **Animated Edges**: Colored edges flow from context sources to AI Context Window
- **Minimap**: Navigate large graphs easily
- **Zoom Controls**: Zoom in/out and fit to view
- **Responsive**: Adapts to container size
- **Theme Aware**: Works with light/dark themes

## Node Colors

- **System Prompt**: Green (#22c55e)
- **Recent Chats**: Red (#ef4444)
- **Current Chat**: Blue (#3b82f6)
- **User Info**: Yellow (#eab308)
- **Session Info**: Purple (#a855f7)
- **AI Context Window**: Indigo (#6366f1) - Larger, bold

## Customization

### Adjust Node Positions

Edit the `position` values in `ContextNetworkGraph.js`:

```jsx
position: { x: 80, y: 80 }, // Adjust x, y coordinates
```

### Change Colors

Modify the `color` and `borderColor` in node data:

```jsx
color: '#22c55e',
borderColor: '#16a34a',
```

### Adjust Graph Size

Change the container height:

```jsx
<div style={{ width: '100%', height: '800px' }}>
  <ContextNetworkGraph />
</div>
```

## Integration Points

The component uses `ChatContextProvider` to get token values. Make sure your context values are being updated:

```jsx
const {
  systemPromptTokens,
  recentChatsTokens,
  currentChatTokens,
  userInfoTokens,
  sessionInfoTokens,
} = useChatContext();
```

## Files Created

- `src/presentation/components/aiChat/providers/ContextNetworkGraph.js` - Main graph component
- `src/presentation/components/aiChat/ContextGraphView.js` - Dialog wrapper component

## Dependencies

- `reactflow` - Already installed ✅
- `react` - Already installed ✅
- `@/components/ui/dialog` - Already available ✅

## Example Integration

See `src/presentation/components/aiChat/providers/ChatContextPopup.js` for reference on how context is currently displayed.
