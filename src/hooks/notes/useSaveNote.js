import { makeAuthenticatedRequest } from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const saveNote = async (data, getToken) => {
  const response = await makeAuthenticatedRequest(
    getToken,
    "patch",
    `/api/v1/notes/${data.id}`,
    data
  );
  return response.data.data;
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
      toast.error("Note saving failed", {
        description: error.message || "Failed to save note",
      });
    },
  });
};

export default useSaveNote;
