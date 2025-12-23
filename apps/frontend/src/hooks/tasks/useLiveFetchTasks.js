import { QueryClient } from "@tanstack/react-query";
import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

const queryClient = new QueryClient();

const fetchAllTasks = async (getToken) => {
  const token = await getToken();
  const response = await axiosClient.get("/api/v1/tasks/user", {
    headers: { Authorization: token },
    withCredentials: true,
  });

  return response.data.data;
};

const useLiveFetchTasks = () => {
  const { getToken } = useAuth();

  const tasksCollection = useMemo(() => {
    return createCollection(
      queryCollectionOptions({
        queryKey: ["tasks"],
        queryFn: () => fetchAllTasks(getToken),
        queryClient,
        getKey: (task) => task.id,
      })
    );
  }, [getToken]);
  return tasksCollection;
};

export default useLiveFetchTasks;
