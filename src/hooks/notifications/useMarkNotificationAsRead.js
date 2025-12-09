import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const markNotificationAsRead = async (id, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "patch",
    `/api/v1/notifications/${id}`
  );
  return response.data.data;
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
