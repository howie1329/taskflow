import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";

const fetchSmartSearch = async (search, getToken) => {
  if (!search || search.trim() === "") return [];
  const token = await getToken();
  console.log(search);
  const response = await axiosClient.post(
    "/api/v1/smart-search/search",
    { search: search },
    {
      headers: { Authorization: token },
      withCredentials: true,
    }
  );
  return response.data.data;
};

const useSmartSearch = (search) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["smart-search", search],
    queryFn: () => fetchSmartSearch(search, getToken),
    enabled: !!search && search.trim() !== "",
  });
};

export default useSmartSearch;
