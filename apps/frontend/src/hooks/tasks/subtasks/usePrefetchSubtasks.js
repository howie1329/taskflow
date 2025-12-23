import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { fetchTaskSubtask } from "./useFetchTaskSubtask";
import { useAuth } from "@clerk/nextjs";
export const usePrefetchSubtasks = (delay = 300) => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const prefetchSubtasks = useCallback(
    debounce((taskId) => {
      const cachedData = queryClient.getQueryData(["subtasks", taskId]);

      if (!cachedData) {
        queryClient.prefetchQuery({
          queryKey: ["subtasks", taskId],
          queryFn: () => fetchTaskSubtask(taskId, getToken),
          staleTime: 60 * 10000,
        });
      }
    }, delay),
    [queryClient, delay]
  );

  return prefetchSubtasks;
};
