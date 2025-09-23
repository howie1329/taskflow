import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const saveNote = async (data, getToken) => {
  try {
    const token = await getToken();
    const response = await axiosClient.patch(`/api/notes/${data.id}`, data, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
};

const useSaveNote = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (data) => saveNote(data, getToken),
    onSuccess: (data) => {
      console.log("data", data);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", data[0].id] });
      router.push(`/mainview/notes/${data[0].id}`);
      toast.success("Note saved successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Note saving failed");
    },
  });
};

export default useSaveNote;
