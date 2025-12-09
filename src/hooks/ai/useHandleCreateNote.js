import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";

const useHandleCreateNote = () => {
  const { getToken } = useAuth();

  const createNote = async (message, model) => {
    const response = await makeAuthenticatedRequest(
      getToken,
      "post",
      "/api/v1/ai/create-note",
      { message: message, model: model }
    );
    return response.data.data;
  };

  return { createNote };
};

export default useHandleCreateNote;
