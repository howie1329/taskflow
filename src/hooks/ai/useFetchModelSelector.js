import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";

const fetchModelSelector = async () => {
  const response = await axiosClient.get("https://openrouter.ai/api/v1/models");
  return response.data.data;
};

const useFetchModelSelector = () => {
  return useQuery({
    queryKey: ["modelSelector"],
    queryFn: () => fetchModelSelector(),
  });
};

export default useFetchModelSelector;
