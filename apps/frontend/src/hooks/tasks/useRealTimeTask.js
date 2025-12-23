"use client";
import axiosClient from "@/lib/axios/axiosClient";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

import { toast } from "sonner";

// Create Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables are not set");
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

const fetchAllTasks = async (getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.get("/api/v1/tasks/user", {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    toast.error("Failed to fetch tasks", {
      description: error.message || "An error occurred",
    });
    throw error;
  }
};

const useRealTimeTask = () => {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef(null);

  // Fetch tasks using React Query
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchAllTasks(getToken),
    staleTime: 2 * 60 * 1000,
    enabled: !!userId,
  });

  // Set up Supabase realtime subscription
  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn("Supabase client not available, realtime updates disabled");
      return;
    }

    // Subscribe to changes in the tasks table
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "*",
          table: "tasks",
          filter: `user_id=eq.${userId}`, // Only listen to tasks for this user
        },
        (payload) => {
          console.log("Realtime event received:", payload);

          // Update React Query cache based on event type
          queryClient.setQueryData(["tasks"], (oldTasks = []) => {
            switch (payload.eventType) {
              case "INSERT":
                // Add new task to the cache
                const newTask = payload.new;
                console.log("New task:", newTask);
                return [...oldTasks, newTask];

              case "UPDATE":
                // Update existing task in the cache
                return oldTasks.map((task) =>
                  task.id === payload.new.id
                    ? { ...task, ...payload.new }
                    : task
                );

              case "DELETE":
                // Remove deleted task from the cache
                return oldTasks.filter((task) => task.id !== payload.old.id);

              default:
                return oldTasks;
            }
          });

          // Show toast notification
          const eventMessages = {
            INSERT: "New task created",
            UPDATE: "Task updated",
            DELETE: "Task deleted",
          };

          toast.success(eventMessages[payload.eventType] || "Task changed", {
            description: new Date().toLocaleString(),
          });
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to tasks changes");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to tasks changes");
          toast.error("Failed to connect to realtime updates");
        }
      });

    subscriptionRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [userId, queryClient]);

  return {
    tasks,
    isLoading,
    error,
  };
};

export default useRealTimeTask;
