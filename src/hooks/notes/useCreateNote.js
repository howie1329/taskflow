"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const createNote = async (data, getToken) => {
  const token = await getToken();
  const response = await axiosClient.post("/api/v1/notes/create", data, {
    headers: { Authorization: token },
    withCredentials: true,
  });
  return response.data.data;
};

const useCreateNote = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data) => createNote(data, getToken),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData(["notes"]);
      queryClient.setQueryData(["notes"], (old) => [...old, data]);
      return { previousNotes };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note created successfully", {
        description: new Date().toLocaleString(),
      });
      router.push(`/mainview/notes/${data[0].id}`);
    },
    onError: (error, variables, context) => {
      console.error(error);
      toast.error("Failed to create note", {
        description: `${error.message} - ${new Date().toLocaleString()}`,
      });
      queryClient.setQueryData(["notes"], context.previousNotes);
    },
  });
};

export default useCreateNote;
