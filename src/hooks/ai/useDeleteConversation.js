import { useQueryClient, useMutation } from "@tanstack/react-query";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
const deleteConversation = async (id, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.delete(`/api/ai/conversations/${id}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.message;
  } catch (error) {
    console.error(error);
  }
};

const useDeleteConversation = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteConversation(id, getToken),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", id],
      });
      const previousConversation = queryClient.getQueryData(["messages", id]);
      queryClient.setQueryData(["messages", id], (old) =>
        old.filter((conversation) => conversation.id !== id)
      );
      return { previousConversation };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables] });
      queryClient.invalidateQueries({ queryKey: ["conversation", variables] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation deleted successfully");
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        ["messages", variables],
        context.previousConversation
      );
      toast.error("Conversation deletion failed");
    },
  });
};

export default useDeleteConversation;
