import { useState } from "react";
import axios from "axios";
import { useToast } from "./use-toast";

const useUpload = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const { toast } = useToast();

  const addTask = () => {
    setLoading(true);
    axios
      .post(url, { data })
      .then((response) => {
        setLoading(false);
        toast({
          title: "Task Flow",
          description: "Your task has been added successfully.",
        });
      })
      .catch((error) => {
        toast({
          variant: "error",
          title: "Task Flow",
          description: "Failed to add task.",
        });
        setError(error);
        console.error(error);
      });
  };

  return { data, setData, loading, error, addTask };
};

export default useUpload;
