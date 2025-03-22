"use client";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

const useDeleteNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, parent_id }) => {
      try {
        console.log("Deleting task with id: ", id);
        const response = await axios.delete(`/api/notes/${id}`);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
    onMutate: async ({ id, parent_id }) => {
      await queryClient.cancelQueries({ queryKey: ["note", id] });

      await queryClient.cancelQueries({ queryKey: ["notes", parent_id] });

      const previousNote = queryClient.getQueryData(["note", id]);
      const previousTaskNote = queryClient.getQueryData(["notes", parent_id]);

      queryClient.setQueryData(["note", id], (old) => updateTask(old, id));
      queryClient.setQueryData(["notes", parent_id], (old) =>
        updateTask(old, id)
      );

      return { previousNote, previousTaskNote };
    },
    onSuccess: ({ id, parent_id }) => {
      toast({ title: "Task Deleted Successfully", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["note", id] });
      queryClient.invalidateQueries({ queryKey: ["notes", parent_id] });
    },
    onError: ({ context, id }) => {
      queryClient.setQueryData(["note", id], context.previousNote);
      queryClient.setQueryData(["notes", parent_id], context.previousTaskNote);
      toast({ title: "Error Deleting Task", status: "error" });
      console.error("Error deleting task");
    },
  });
};

const updateTask = (old, id) => {
  return old?.filter((note) => note.id != id);
};

export default useDeleteNote;
