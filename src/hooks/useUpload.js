import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const uploadTask = async (data) => {
  try {
    const response = await axios.post("/api/todo", data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const useUpload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

export default useUpload;
