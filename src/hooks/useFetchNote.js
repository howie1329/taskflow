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

const useFetchNote = (id) => {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => singleNote(id),
    staleTime: 60 * 10000,
  });
};

export default useFetchNote;
