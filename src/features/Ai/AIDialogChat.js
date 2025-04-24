"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useUploadAITask from "@/features/Ai/hooks/useUploadAITask";
import { DialogTrigger } from "@radix-ui/react-dialog";
import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

const AIDialogChat = () => {
  const { getToken, userId } = useAuth();
  const uploadAI = useUploadAITask();
  const [userResponse, setUserResponse] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sendToAI = () => {
    const token = getToken();
    const prompt = `The users is going to give you a prompt. I want you to break it down into subtask and add any notes you think might be helpful to complete the task. The user will also provide you with a priority level, a due date, and labels for the task. Also inside of note add the subtask and details you think the user might need to complete the subtask or task. Make sure priority is either Low, Medium, High and is capitlized as well. The current date is ${Date.now()}. Do not set due date before the current date. `;
    const fullPrompt = prompt + userResponse;
    const data = { prompt: prompt + fullPrompt, token: token, userId: userId };
    uploadAI.mutate(data);
    setUserResponse("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="group relative overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 text-white transition-all hover:scale-105 hover:shadow-lg">
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Ask Flow
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Ask Flow
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Type in some details about your task and flow will handle the rest.
          </DialogDescription>
        </DialogHeader>
        <div className="relative mt-4">
          <Textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder="What do you need help with..."
            className="min-h-[150px] resize-none rounded-lg border-gray-200 bg-gray-50 p-4 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
          <div className="absolute bottom-2 right-2 text-sm text-gray-400">
            {userResponse.length}/500
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            onClick={sendToAI}
            disabled={!userResponse.trim() || uploadAI.isLoading}
            className={cn(
              "w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white transition-all hover:scale-105 hover:shadow-lg",
              uploadAI.isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {uploadAI.isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </div>
            ) : (
              "Ask Flow"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIDialogChat;
