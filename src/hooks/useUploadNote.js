import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
const uploadNote = async (data) => {
  try {
    const response = await axios.post("/api/notes", data);
    return response.data;
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

export default useUploadNote;
