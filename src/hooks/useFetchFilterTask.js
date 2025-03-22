"use client";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const filterTasks = async (filter) => {
  try {
    const response = await axios.get(`/api/task/filter/${filter}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const useFetchFilterTask = (filter) => {
  return useQuery({
    queryKey: ["tasks", filter],
    queryFn: () => filterTasks(filter),
    staleTime: 60 * 10000,
  });
};

export { useFetchFilterTask, filterTasks };
