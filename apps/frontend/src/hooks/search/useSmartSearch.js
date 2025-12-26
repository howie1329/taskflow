import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";

const fetchSmartSearch = async (search, getToken, signal) => {
  if (!search || search.trim() === "") return null;
  const token = await getToken();
  const response = await axiosClient.post(
    "/api/v1/smart-search/search",
    { search: search },
    {
      headers: { Authorization: token },
      withCredentials: true,
      signal, // Enable request cancellation
    }
  );
  return response.data.data;
};

const useSmartSearch = (search) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["smart-search", search],
    queryFn: ({ signal }) => fetchSmartSearch(search, getToken, signal),
    enabled: !!search && search.trim() !== "",
    staleTime: 30000, // Cache results for 30 seconds
  });
};

export default useSmartSearch;
