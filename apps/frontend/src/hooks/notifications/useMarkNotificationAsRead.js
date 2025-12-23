import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const markNotificationAsRead = async (id, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.patch(`/api/v1/notifications/${id}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
};

export const useMarkNotificationAsRead = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => markNotificationAsRead(id, getToken),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old) =>
        old.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
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
      console.error(error);
    },
  });
};
