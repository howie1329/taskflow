import axios from "axios";

const uploadSubtask = async (data) => {
  try {
    const response = await axios.post("/api/todo/subtask", data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export default uploadSubtask;
