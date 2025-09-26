"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const deleteNotification = async (id, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.delete(`/api/notifications/${id}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
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
