import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "./use-toast";

const useGetTasks = (apiEndpoint) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    axios
      .get("/api/todo")
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
        toast({
          title: "Task Flow",
          description: "Your tasks has been loaded successfully.",
        });
      })
      .catch((error) => {
        toast({
          variant: "error",
          title: "Task Flow",
          description: "Failed to load tasks.",
        });
        setError(error);
        console.log(error);
      });
  }, [apiEndpoint]);

  return { tasks, loading, error };
};

export default useGetTasks;
