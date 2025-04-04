import axios from "axios";
import { clearTasksFromIndexedDB, saveTaskToDexie } from "../DexieDB";

export async function syncIndexedDBWithRedis() {
  const redisTasks = await axios.get("/api/redis");
  console.log("Data from Redis IN INdex:", redisTasks.data);
  try {
    //const tasks = await JSON.parse(redisTasks.data);
    if (redisTasks.data.length > 0) {
      console.log("Syncing IndexedDB with Redis...");
      await clearTasksFromIndexedDB();
      await saveTaskToDexie(redisTasks.data);
      console.log(
        "IndexedDB synced with Redis successfully at:" +
          new Date().toLocaleString()
      );
    }
  } catch (error) {
    console.error("Error syncing IndexedDB with Redis:", error);
  }
}
