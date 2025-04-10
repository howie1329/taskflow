"use client";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import axiosClient from "@/lib/axiosClient";

const singleNote = async (id, getToken) => {
  const token = getToken();
  try {
    const response = await axiosClient.get(`/api/tasks/notes/${id}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.notes;
  } catch (error) {
    console.error(error);
  }
};

const useFetchSingleNote = (taskId) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["notes", taskId],
    queryFn: () => singleNote(taskId, getToken),
    staleTime: 60 * 10000,
    enabled: !!taskId,
  });
};

export { useFetchSingleNote, singleNote };
