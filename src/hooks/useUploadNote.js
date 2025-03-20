import axios from "axios";

const uploadNote = async (data) => {
  try {
    const response = await axios.post("/api/note", data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export default uploadNote;
