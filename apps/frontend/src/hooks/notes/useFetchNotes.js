"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const fetchNotes = async (getToken) => {
  try {
    const token = await getToken();
    const response = await axiosClient.get("/api/v1/notes/user", {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch notes", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useFetchNotes = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["notes"],
    queryFn: () => fetchNotes(getToken),
    staleTime: 2 * 60 * 1000,
  });
};

export default useFetchNotes;
