import axios from "axios";

export async function syncRedisToSupabase() {
  try {
    const data = await axios.get("/api/task/sync");
    if (data && data.length > 0) {
      console.log("Redis invalidated successfully");
      const response = await axios.post("/api/redis", data);
      console.log("Redis set successfully");

      return response;
    }
  } catch (error) {
    console.error("Error syncing Redis to Supabase:", error);
  }
}
