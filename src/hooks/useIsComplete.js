"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useIsComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const response = await axios.patch(`/api/todo/${id}`, data);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      console.error("Error completing task");
    },
  });
};

export default useIsComplete;
