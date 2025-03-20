"use client";
import axios from "axios";
import { useToast } from "./use-toast";
import { useQuery } from "@tanstack/react-query";

const fetchAllNotes = async () => {
  try {
    const response = await axios.get("/api/notes");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
const useGetAllNotes = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["notes"],
    queryFn: fetchAllNotes,
    staleTime: 60 * 10000,
  });
};

export default useGetAllNotes;
