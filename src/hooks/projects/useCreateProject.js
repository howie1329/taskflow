"use client";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosClient from "@/lib/axios/axiosClient";

const createProject = async (project, getToken) => {
  try {
    const token = await getToken();
    const response = await axiosClient.post("/api/projects/create", project, {
      headers: {
        Authorization: token,
      },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Project creation failed", {
      description: `${error.message} - ${new Date().toLocaleString()}`,
    });
  }
};

const useCreateProject = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (project) => createProject(project, getToken),
    onMutate: async (project) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData(["projects"]);
      queryClient.setQueryData(["projects"], (old) => [...old, project]);
      return { previousProjects };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully", {
        description: new Date().toLocaleString(),
      });
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["projects"], context.previousProjects);
      toast.error("Project creation failed", {
        description: `${
          context.error.message
        } - ${new Date().toLocaleString()}`,
      });
    },
  });
};

export default useCreateProject;
