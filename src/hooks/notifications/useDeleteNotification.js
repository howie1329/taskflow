"use client";
import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const deleteNotification = async (id, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "delete",
    `/api/v1/notifications/${id}`
  );
  return response.data.data;
};

export const useDeleteNotification = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteNotification(id, getToken),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old) =>
        old.filter((notification) => notification.id !== id)
      );
      return { previousNotifications };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        ["notifications"],
        context.previousNotifications
      );
    },
  });
};
