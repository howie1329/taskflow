"use client";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { GeneralKanbanTaskBoard } from "@/presentation/components/task/GeneralKanbanTaskBoard";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  SearchIcon,
  SendIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

import { CreateTaskDialog } from "@/presentation/components/task/CreateTaskDialog";
import { FilterDropdownCard } from "@/presentation/components/task/FilterDropDownCard";
import { useTaskUIStore } from "@/presentation/hooks/useTaskUIStore";
import useFetchAllTasks from "@/hooks/tasks/useFetchAllTasks";
import { motion } from "motion/react";
import useFetchSingleConversation from "@/hooks/ai/useFetchSingleConversation";
import useSendAIMessage from "@/hooks/ai/useSendAIMessage";
import useDeleteConversation from "@/hooks/ai/useDeleteConversation";
function Page() {
  const { data: tasks } = useFetchAllTasks();
  const [isMiniAIChatOpen, setIsMiniAIChatOpen] = useState(false);
  const {
    activeSearch,
    searchQuery,
    filteredData,
    filterStatuses,
    isFilterOpen,
    isCreateTaskOpen,
    setActiveSearch,
    setSearchQuery,
    setIsFilterOpen,
    setIsCreateTaskOpen,
    handleStatusFilterChange,
    getFilteredData,
  } = useTaskUIStore();

  useEffect(() => {
    getFilteredData(tasks);
  }, [searchQuery, tasks, activeSearch, filterStatuses, getFilteredData]);

  return (
    <div className="flex flex-col overflow-hidden h-[93vh]">
      <div className="flex-shrink-0 p-1 flex flex-row justify-between items-center gap-1">
        <h1 className="text-lg font-bold ">Task Board</h1>
        {activeSearch && (
          <Input
            className="flex-1 p-2 rounded-sm h-8"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        <Card className="flex flex-row justify-between items-center p-1 gap-1 rounded-sm relative">
          <Button
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
            onClick={() => setIsCreateTaskOpen(true)}
          >
            <PlusIcon className="w-2 h-2" />
          </Button>
          <Button
            variant="outline"
            className={`p-1 h-6 w-6 rounded-full ${
              activeSearch ? "bg-accent" : ""
            }`}
            onClick={() => setActiveSearch(!activeSearch)}
          >
            <SearchIcon className="w-2 h-2" />
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
            <FilterIcon className="w-2 h-2" />
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
            <SparklesIcon className="w-2 h-2" />
          </Button>
        </Card>
      </div>
      <Separator />
      <div className="flex-1 overflow-hidden">
        <GeneralKanbanTaskBoard data={filteredData} />
      </div>
      {/* Create Task Dialog - Modal */}
      <CreateTaskDialog
        isOpen={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
      />
      {isMiniAIChatOpen && (
        <MiniAIChat onClose={() => setIsMiniAIChatOpen(false)} />
      )}
    </div>
  );
}

const MiniAIChat = ({ onClose }) => {
  const [conversationId, setConversationId] = useState(crypto.randomUUID());
  const { mutate: sendMessage } = useSendAIMessage();
  const { data: messages } = useFetchSingleConversation(conversationId);
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
      className="absolute bottom-50 right-5 z-50 flex flex-col h-[50vh] w-[25vw] bg-card rounded-2xl border shadow-2xl p-2 gap-2"
    >
      <div className="flex flex-row justify-between items-center sticky top-0 border-b border-border">
        <p className="text-sm font-medium">TaskFlow Chat Agent</p>
        <Button
          variant="outline"
          className="p-1 h-6 w-6 rounded-full"
          onClick={handleDeleteConversation}
        >
          <XIcon className="w-2 h-2" />
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
      <div className="flex flex-row justify-between items-center gap-2 rounded-lg shadow-lg bg-gray-100 ">
        <input
          className="w-full h-10 p-2 text-sm focus:outline-none focus:ring-0 "
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
          <SendIcon className="w-2 h-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default Page;
