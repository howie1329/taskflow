"use client";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

const useDeleteNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, parent_id = "" }) => {
      console.log("Deleting task with id: ", id);
      try {
        const response = await axios.delete(`/api/notes/${id}`);
        return response.data;
      } catch (error) {
        console.error(error);
        throw error; // Ensure the error is thrown to trigger onError
      }
    },
    onMutate: async ({ id, parent_id }) => {
      await queryClient.cancelQueries({ queryKey: ["note", id] });
      await queryClient.cancelQueries({ queryKey: ["notes", parent_id] });

      const previousNote = queryClient.getQueryData(["note", id]);
      const previousTaskNote = queryClient.getQueryData(["notes", parent_id]);

      queryClient.setQueryData(["notes"], (old) => {});
      queryClient.setQueryData(["note", id], (old) => {});
      queryClient.setQueryData(["notes", parent_id], (old) => {});

      return { previousNote, previousTaskNote };
    },
    onSuccess: (data, variables, context) => {
      toast({ title: "Task Deleted Successfully", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.parent_id],
      });
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["notes"], context.previousNote);
      queryClient.setQueryData(
        ["note", variables.id],
        context.previousTaskNote
      );
      queryClient.setQueryData(
        ["notes", variables.parent_id],
        context.previousTaskNote
      );
      toast({ title: "Error Deleting Task", status: "error" });
      console.error("Error deleting task:", error);
    },
  });
};

export default useDeleteNote;
