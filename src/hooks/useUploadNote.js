import axios from "axios";

const useUploadNote = () => {
  const uploadNote = async (data) => {
    try {
      const note = {
        title: data.title,
        description: data.description,
        content: data.content,
      };
      const response = await axios.post("/api/notes", note);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };
  return uploadNote;
};

export default useUploadNote;
