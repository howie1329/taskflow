"use client";
import axios from "axios";
import { useToast } from "./use-toast";
import { useQuery } from "@tanstack/react-query";

const fetchStats = () => {
  try {
    const response = axios.get("/api/stats");
    return response;
  } catch (error) {
    console.error(error);
  }
};

const useFetchStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 60 * 10000,
  });
};

export default useFetchStats;
