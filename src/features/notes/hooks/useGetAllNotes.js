"use client";
import axios from "axios";
import { useToast } from "../../../hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { useAuth } from "@clerk/nextjs";

const fetchAllNotes = async (getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get("/api/notes/user", {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.notes;
  } catch (error) {
    console.error(error);
  }
};
const useGetAllNotes = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["notes"],
    queryFn: () => fetchAllNotes(getToken),
    staleTime: 60 * 10000,
  });
};

export default useGetAllNotes;
