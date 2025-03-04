import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import uploadSubtask from "./useUploadSubTask";

const uploadTask = async (data) => {
  try {
    let subTasks = null;
    if (data.subTasks) {
      subTasks = data.subTasks;
      delete data.subTasks;
    }
    if (data.labels == "" || data.labels == null) {
      data.labels = null;
    } else {
      if (data.labels.includes(",")) {
        data.labels = data.labels.split(",");
      } else {
        data.labels = [data.labels];
      }
    }

    const response = await axios.post("/api/todo", data);
    if (subTasks) {
      subTasks.forEach(async (subTask) => {
        subTask["task_id"] = response.data[0].id;
        console.log("subtask name", subTask.subTask_name);
        if (subTask.subTask_name == null) return;
        await uploadSubtask(subTask);
      });
    }
    return response;
  } catch (error) {
    console.error(error);
  }
};

const useUpload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

export default useUpload;
