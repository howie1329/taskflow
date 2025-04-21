"use client";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import axiosClient from "@/lib/axiosClient";

const singleNote = async (id, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get(`/api/notes/${id}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.note[0];
  } catch (error) {
    console.error(error);
  }
};

const useFetchNote = (id) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => singleNote(id, getToken),
    staleTime: 60 * 10000,
  });
};

export { useFetchNote, singleNote };
