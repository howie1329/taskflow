import axiosClient from "@/lib/axiosClient";
import axios from "axios";

const uploadSubtask = async (data, token) => {
  try {
    const response = await axiosClient.post("/api/subtasks/create", data, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.subtask[0];
  } catch (error) {
    console.error(error);
  }
};

export default uploadSubtask;
