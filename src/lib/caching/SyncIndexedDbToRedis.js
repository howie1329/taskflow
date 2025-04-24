import axiosClient from "../axiosClient";
import { clearTasksFromIndexedDB, saveTaskToDexie } from "../DexieDB";

export const redisSync = async (getToken) => {
  const token = await getToken();

  if (token) {
    try {
      const response = await axiosClient.get("/api/redis", {
        headers: { Authorization: token },
        withCredentials: true,
      });
      console.log("Data Sync", response.data.tasks);
      if (response.data.tasks.length > 0) {
        console.log("Syncing IndexedDB with Redis...");
        await clearTasksFromIndexedDB();
        await saveTaskToDexie(response.data.tasks);
        console.log(
          "IndexedDB synced with Redis successfully at:" +
            new Date().toLocaleString()
        );
      }
    } catch (error) {
      console.error("Error syncing IndexedDB with Redis:", error);
    }
  }
};
