import axios from "axios";
import { clearTasksFromIndexedDB, saveTaskToDexie } from "../DexieDB";

export async function syncIndexedDBWithRedis() {
  const redisTasks = await axios.get("/api/redis");
  try {
    if (redisTasks.length > 0) {
      const tasks = await JSON.parse(redisTasks);
      console.log("Syncing IndexedDB with Redis...");
      await clearTasksFromIndexedDB();
      await saveTaskToDexie(tasks);
      console.log(
        "IndexedDB synced with Redis successfully at:" +
          new Date().toLocaleString()
      );
    }
  } catch (error) {
    console.error("Error syncing IndexedDB with Redis:", error);
  }
}
