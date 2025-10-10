"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const fetchSingleNote = async (noteId, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get(`/api/v1/notes/${noteId}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    toast.success("Note fetched successfully", {
      description: new Date().toLocaleString(),
    });
    console.log("response.data.data", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch note", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useFetchSingleNote = (noteId) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["note", noteId],
    queryFn: () => fetchSingleNote(noteId, getToken),
    staleTime: 2 * 60 * 1000,
  });
};

export default useFetchSingleNote;
