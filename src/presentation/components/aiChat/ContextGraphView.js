"use client";
import { useState } from "react";
import { ContextNetworkGraph } from "./providers/ContextNetworkGraph";
import { ChatContextProvider } from "./providers/ChatContextProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartIcon } from "@hugeicons/core-free-icons/index";

/**
 * Context Graph View Component
 * 
 * Shows a network graph visualization of context management.
 * Can be used as a standalone component or opened in a dialog.
 */
export const ContextGraphView = ({ asDialog = true }) => {
  if (asDialog) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <HugeiconsIcon icon={ChartIcon} size={20} strokeWidth={2} />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden">
          <div className="p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Context Management Graph</h2>
            <div className="flex-1 min-h-0 overflow-hidden">
              <ChatContextProvider>
                <ContextNetworkGraph />
              </ChatContextProvider>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="w-full h-full">
      <ChatContextProvider>
        <ContextNetworkGraph />
      </ChatContextProvider>
    </div>
  );
};
