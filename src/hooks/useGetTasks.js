"use client";
import axios from "axios";
import { useToast } from "./use-toast";
import { useQuery } from "@tanstack/react-query";

const fetchTask = async () => {
  try {
    const response = await axios.get("/api/todo");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
const useGetTasks = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTask,
    staleTime: 60 * 10000,
  });
};

export default useGetTasks;
