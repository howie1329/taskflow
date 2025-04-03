"use client";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  clearTasksFromIndexedDB,
  getAllTaskFromDexie,
  saveTaskToDexie,
} from "@/lib/DexieDB";

const fetchTaskFromApi = async () => {
  try {
    const response = await axios.get("/api/task");

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchTasks = async (userId) => {
  if (!userId) return [];

  console.log("2 MIN REFRESH");
  const cachedTask = await getAllTaskFromDexie(userId);

  if (cachedTask.length > 0) {
    return cachedTask;
  }

  const tasks = await fetchTaskFromApi();
  await clearTasksFromIndexedDB();
  await saveTaskToDexie(tasks);

  return tasks;
};

const useGetTasks = (userId) => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(userId),
    staleTime: 60 * 2000, // 2 mins
    enabled: !!userId,
  });
};

export default useGetTasks;
