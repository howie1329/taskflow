"use client";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const singleNote = async (id) => {
  try {
    const response = await axios.get(`/api/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const useFetchSingleNote = (taskId) => {
  return useQuery({
    queryKey: ["notes", taskId],
    queryFn: () => singleNote(taskId),
    staleTime: 60 * 10000,
    enabled: !!id,
  });
};

export { useFetchSingleNote, singleNote };
