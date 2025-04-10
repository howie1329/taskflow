import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import axiosClient from "@/lib/axiosClient";
const uploadNote = async (data) => {
  console.log(data);
  const token = data.token;
  delete data.token;
  try {
    const response = await axiosClient.post("/api/notes/create", data, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.note[0];
  } catch (error) {
    console.error(error);
  }
};
const useUploadNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: uploadNote,
    onMutate: async (newNote) => {
      await queryClient.cancelQueries("notes");

      const previousNotes = queryClient.getQueryData("notes");

      queryClient.setQueryData(["notes"], (old) => [...old, newNote]);

      return { previousNotes };
    },
    onSuccess: () => {
      toast({ title: "Note Added Successfully", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (context) => {
      queryClient.setQueryData(["notes"], context.previous);
      console.error("Error uploading note");
    },
  });
};

export { useUploadNote, uploadNote };
