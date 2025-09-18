import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";

const fetchModelSelector = async () => {
  const response = await axiosClient.get("/api/ai/models");
  return response.data.data;
};

const useFetchModelSelector = () => {
  return useQuery({
    queryKey: ["modelSelector"],
    queryFn: () => fetchModelSelector(),
  });
};

export default useFetchModelSelector;
