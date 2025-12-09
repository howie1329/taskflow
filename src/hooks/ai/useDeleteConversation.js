import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const deleteConversation = async (id, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "delete",
    `/api/v1/conversations/${id}`
  );
  return response.data.message;
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
      toast.error("Conversation deletion failed", {
        description: error.message || "Failed to delete conversation",
      });
    },
  });
};

export default useDeleteConversation;
