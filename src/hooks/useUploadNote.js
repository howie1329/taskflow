import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
const uploadNote = async (data) => {
  try {
    const note = {
      title: data.title,
      description: data.description,
      content: data.content,
    };
    const response = await axios.post("/api/notes", note);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
const useUploadNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadNote,
    onMutate: async (newNote) => {
      await queryClient.cancelQueries("notes");

      const previousNotes = queryClient.getQueryData("notes");

      queryClient.setQueryData(["notes"], (old) => [...old, newNote]);

      return { previousNotes };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
    onError: (context) => {
      queryClient.setQueryData(["notes"], context.previous);
      console.error("Error uploading note");
    },
  });
};

export default useUploadNote;
