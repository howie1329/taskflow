"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const deleteNote = async (id, getToken) => {
  const token = await getToken();
  const response = await axiosClient.delete(`/api/notes/${id}`, {
    headers: { Authorization: token },
    withCredentials: true,
  });

  return response.data.data;
};

const useDeleteNote = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id) => deleteNote(id, getToken),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData(["notes"]);
      queryClient.setQueryData(["notes"], (old) =>
        old.filter((note) => note.id !== id)
      );
      return { previousNotes };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/mainview/notes");
      toast.success("Note deleted successfully");
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["notes"], context.previousNotes);
      toast.error("Note deletion failed");
    },
  });
};

export default useDeleteNote;
