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

const AIDialogChat = () => {
  const uploadAI = useUploadAITask();
  const [userResponse, setUserResponse] = useState("");

  const sendToAI = () => {
    const prompt = `The users is going to give you a prompt. I want you to break it down into subtask and add any notes you think might be helpful to complete the task. The user will also provide you with a priority level, a due date, and labels for the task. Also inside of note add the subtask and details you think the user might need to complete the subtask or task. Make sure priority is either Small, Medium, High and is capitlized as well. The current date is ${Date.now()}. Do not set due date before the current date`;
    const fullPrompt = prompt + userResponse;
    const data = { prompt: prompt + fullPrompt };
    uploadAI.mutate(data);
    setUserResponse("");
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>ASK FLOW!!</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ask Flow</DialogTitle>
          <DialogDescription>
            Type in some details about your task and flow will handle the rest.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          placeholder={"What do you need help with..."}
        />
        <DialogFooter>
          <Button type="submit" onClick={sendToAI}>
            Ask Flow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIDialogChat;
