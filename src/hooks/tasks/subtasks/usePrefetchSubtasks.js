import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { fetchTaskSubtask } from "./useFetchTaskSubtask";

export const usePrefetchSubtasks = (delay = 300) => {
  const queryClient = useQueryClient();

  const prefetchSubtasks = useCallback(
    debounce((taskId) => {
      const cachedData = queryClient.getQueryData(["subtasks", taskId]);

      if (!cachedData) {
        queryClient.prefetchQuery({
          queryKey: ["subtasks", taskId],
          queryFn: () => fetchTaskSubtask(taskId),
          staleTime: 60 * 10000,
        });
      }
    }, delay),
    [queryClient, delay]
  );

  return prefetchSubtasks;
};
