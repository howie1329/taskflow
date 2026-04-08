import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";

const useHandleCreateNote = () => {
  const { getToken } = useAuth();

  const createNote = async (message, model) => {
    const token = await getToken();
    const response = await axiosClient.post(
      "/api/v1/ai/create-note",
      { message: message, model: model },
      {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      }
    );
    return response.data.data;
  };

  return { createNote };
};

export default useHandleCreateNote;
