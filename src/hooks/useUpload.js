import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import uploadSubtask from "./useUploadSubTask";
import { useToast } from "./use-toast";
import { clearTasksFromIndexedDB } from "@/lib/DexieDB";
import axiosClient from "@/lib/axiosClient";

const uploadTask = async (data) => {
  const token = await data.token;
  console.log("DATA START:", data);
  try {
    console.log("Inside Try");
    let subTasks = null;
    if (data.subTasks.length > 0) {
      subTasks = data.subTasks;
      delete data.subTasks;
    }
    console.log("Before Labels");
    if (data.labels == "" || data.labels == null) {
      data.labels = null;
    } else {
      if (data.labels.includes(",")) {
        data.labels = data.labels.split(",");
      } else {
        data.labels = [data.labels];
      }
    }
    console.log("Here");
    delete data.token;

    const response = await axiosClient.post("/api/tasks/create", data, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    console.log("Subtasks: ", subTasks);
    if (subTasks.length > 0) {
      subTasks.forEach(async (subTask) => {
        subTask["task_id"] = response.data[0].id;
        if (subTask.subTask_name == null) return;
        await uploadSubtask(subTask);
      });
    }
    return response.data.task[0];
  } catch (error) {
    console.error(error);
  }
};

const useUpload = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: uploadTask,
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTask = queryClient.getQueryData(["tasks"]);

      console.log(newTask);

      queryClient.setQueryData(["tasks"], (old) => [...old, newTask]);

      return { previousTask };
    },
    onError: (context) => {
      toast({ title: "Task Upload Failed", status: "error" });
      queryClient.setQueryData(["tasks"], context.previousTask);
    },
    onSuccess: async () => {
      toast({ title: "Task Uploaded Successfully", status: "success" });
      await clearTasksFromIndexedDB();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export default useUpload;
