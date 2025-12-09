"use client";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { FilterDropdownCard } from "./FilterDropDownCard";
import { useTaskFilters } from "./TaskFilterContext";
import { motion } from "motion/react";
import useSendAIMessage from "@/hooks/ai/useSendAIMessage";
import useDeleteConversation from "@/hooks/ai/useDeleteConversation";
import useFetchConversationMessages from "@/hooks/ai/useFetchConversationMessages";
import useFetchConversation from "@/hooks/ai/useFetchConversation";
import {
  PlusSignIcon,
  Search02Icon,
  FilterIcon,
  AiEditingIcon,
  SentIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { useTaskData } from "./TaskDataProvider";
import { getBoardComponent } from "./boards/BoardRegistry";

/**
 * TaskPageClient - Client-side component that handles all interactive logic
 * 
 * This component is separated from the page to allow the page to be a server component.
 * It handles:
 * - UI state management (search, filters, dialogs) - now via TaskFilterContext
 * - Board rendering with configurable board types
 * 
 * Note: Data filtering is handled in TaskDataProvider
 */
export const TaskPageClient = ({ boardType = "kanban", boardConfig = {} }) => {
  // Get filtered data directly from provider - filtering logic is now in TaskDataProvider
  const { filteredTasks } = useTaskData();
  const [isMiniAIChatOpen, setIsMiniAIChatOpen] = useState(false);
  
  // Get filter state from TaskFilterContext (replaces Zustand)
  const {
    activeSearch,
    searchQuery,
    filterStatuses,
    isFilterOpen,
    isCreateTaskOpen,
    setActiveSearch,
    setSearchQuery,
    setIsFilterOpen,
    setIsCreateTaskOpen,
    handleStatusFilterChange,
  } = useTaskFilters();

  // Get the board component based on type
  const BoardComponent = getBoardComponent(boardType);

  const handleTaskUpdate = (taskId, updates) => {
    // This callback can be used for additional logic when tasks are updated
    // For now, the board handles updates internally via the API
    console.log("Task updated:", taskId, updates);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col overflow-hidden h-full rounded-md"
    >
      <div className="flex-shrink-0 p-1 flex flex-row justify-between items-center gap-1">
        <h1 className="text-lg font-bold ">Task Board</h1>
        {activeSearch && (
          <motion.Input
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 p-2 rounded-md h-8 bg-card border text-sm text-center"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        <Card className="flex flex-row justify-between items-center p-1 gap-1 rounded-none relative shadow-none">
          <Button
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
            onClick={() => setIsCreateTaskOpen(true)}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            className={`p-1 h-6 w-6 rounded-full ${
              activeSearch ? "bg-accent" : ""
            }`}
            onClick={() => setActiveSearch(!activeSearch)}
          >
            <HugeiconsIcon icon={Search02Icon} size={20} strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            className={`p-1 h-6 w-6 rounded-full ${
              filterStatuses.length > 1 || !filterStatuses.includes("all")
                ? "bg-accent"
                : ""
            }`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <HugeiconsIcon icon={FilterIcon} size={20} strokeWidth={2} />
          </Button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <FilterDropdownCard
              filterStatuses={filterStatuses}
              onFilterChange={handleStatusFilterChange}
            />
          )}
          {/* Mini AI Chat Feature Button */}
          <Button
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
            onClick={() => setIsMiniAIChatOpen(!isMiniAIChatOpen)}
          >
            <HugeiconsIcon icon={AiEditingIcon} size={20} strokeWidth={2} />
          </Button>
        </Card>
      </div>
      <Separator />
      <div className="flex-1 overflow-hidden">
        <BoardComponent 
          data={filteredTasks || []} 
          onTaskUpdate={handleTaskUpdate}
          config={boardConfig}
        />
      </div>
      {/* Create Task Dialog - Modal */}
      <CreateTaskDialog
        isOpen={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
      />
      {isMiniAIChatOpen && (
        <MiniAIChat onClose={() => setIsMiniAIChatOpen(false)} />
      )}
    </motion.div>
  );
};

const MiniAIChat = ({ onClose }) => {
  const [conversationId, setConversationId] = useState(crypto.randomUUID());
  const { mutate: sendMessage } = useSendAIMessage();
  const { data: messages } = useFetchConversationMessages(conversationId);
  const { data: conversation } = useFetchConversation(conversationId);
  const { mutate: deleteConversation } = useDeleteConversation();
  const [message, setMessage] = useState("");
  
  const handleSendMessage = (message) => {
    setMessage("");
    sendMessage({
      newMessage: message,
      conversationId: conversationId,
      model: "gpt-4o-mini",
      status: "inline-chat",
    });
  };
  
  const handleDeleteConversation = () => {
    deleteConversation(conversationId);
    onClose();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute bottom-10 right-5 z-50 flex flex-col h-[50vh] w-[25vw] bg-card rounded-2xl border shadow-2xl p-2 gap-2"
    >
      <div className="flex flex-row justify-between items-center sticky top-0 border-b border-border">
        <p className="text-sm font-medium">TaskFlow Chat Agent</p>
        <Button
          variant="outline"
          className="p-1 h-6 w-6 rounded-full"
          onClick={handleDeleteConversation}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {messages?.map((message) => (
          <div key={message.id}>
            <div
              className={`${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <span className="text-xs text-gray-500">
                {message.role === "user" ? "You" : "Assistant"}
              </span>

              <span className="text-sm">{message.content}</span>
            </div>
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex flex-row justify-between items-center gap-2 rounded-md border bg-card/50 ">
        <input
          className="w-full h-6 p-2 text-sm focus:outline-none focus:ring-0 "
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything"
        />

        <Button
          variant="default"
          className="p-1 h-6 w-6 rounded-full"
          onClick={() => handleSendMessage(message)}
          disabled={message.length === 0}
        >
          <HugeiconsIcon icon={SentIcon} size={20} strokeWidth={2} />
        </Button>
      </div>
    </motion.div>
  );
};
