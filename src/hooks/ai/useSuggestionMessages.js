"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const fetchSuggestedMessages = async (getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.post("/api/v1/ai/suggested-messages", {
      headers: { Authorization: token },
      withCredentials: true,
    });
    console.log("response.data.data suggested messages", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch suggested messages", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useSuggestionMessages = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["suggestedMessages"],
    queryFn: () => fetchSuggestedMessages(getToken),
    enabled: !!getToken,
  });
};

export default useSuggestionMessages;
