import axiosClient from "../axiosClient";

export const syncRedisToSupabase = async (getToken) => {
  const token = await getToken();

  try {
    if (token) {
      const response = await axiosClient.get("/background/sync", {
        headers: { Authorization: token },
        withCredentials: true,
      });

      if (response) {
        console.log(
          "Sync From Supabase To Redis was Sucessful at: " +
            new Date().toLocaleString()
        );
      }
    }
  } catch (error) {
    console.error("Error syncing Supabase to Redis: ", error);
  }
};
