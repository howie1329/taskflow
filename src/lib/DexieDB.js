"use client";
import Dexie from "dexie";

export const db = new Dexie("TaskFlowDb");

db.version(1).stores({
  tasks:
    "id, userId, title, description, date, isCompleted, labels, priority, position",
});

export const getAllTaskFromDexie = async (userId) => {
  try {
    return await db.tasks.where("userId").equals(userId).toArray();
  } catch (error) {
    console.log("Error Fetching Task From IndexDb: ", error);
    return [];
  }
};

export const saveTaskToDexie = async (tasks) => {
  try {
    await db.tasks.clear();
    await db.tasks.bulkPut(tasks);
  } catch (error) {
    console.error("Error saving tasks to IndexedDB:", error);
  }
};

export const clearTasksFromIndexedDB = async () => {
  try {
    await db.tasks.clear();
  } catch (error) {
    console.error("Error clearing IndexedDB:", error);
  }
};
