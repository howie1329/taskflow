"use client";
import { useQuery } from "@tanstack/react-query";
import {
  clearTasksFromIndexedDB,
  getAllTaskFromDexie,
  saveTaskToDexie,
} from "@/lib/DexieDB";
import { TANSTACK_QUERY_STALE_TIME } from "@/lib/constants";
import axiosClient from "@/lib/axiosClient";
import { useAuth } from "@clerk/nextjs";

const fetchTaskFromApi = async (getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get("/api/tasks/user", {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.tasks;
  } catch (error) {
    console.error(error);
  }
};

const fetchTasks = async ({ userId, getToken }) => {
  if (!userId) return [];

  try {
    console.log("2 MIN REFRESH Fetching Task");
    const cachedTask = await getAllTaskFromDexie(userId);

    if (cachedTask.length > 0) {
      return cachedTask;
    }

    // Fetch from API if no cached data
    console.log("Fallback to Fetching from API as no data in indexedDB");
    const tasks = await fetchTaskFromApi(getToken);
    await clearTasksFromIndexedDB();
    await saveTaskToDexie(tasks);
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks ", error);
  }
};

const useGetTasks = (userId) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks({ userId: userId, getToken: getToken }),
    staleTime: TANSTACK_QUERY_STALE_TIME, // 2 mins
    enabled: !!userId,
  });
};

export default useGetTasks;
