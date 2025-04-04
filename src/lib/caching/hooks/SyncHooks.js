"use client";
import { useEffect } from "react";
import { syncIndexedDBWithRedis } from "../SyncIndexToRedis";
import { syncRedisToSupabase } from "../SyncRedisToSupabase";
import { INDEXEDDB_STALE_TIME, REDIS_CACHE_TIME } from "@/lib/constants";

export function useSyncIndexedDBWithRedis() {
  useEffect(() => {
    console.log("Syncing IndexedDB with Redis");
    syncIndexedDBWithRedis();

    const interval = setInterval(syncIndexedDBWithRedis, INDEXEDDB_STALE_TIME); // 6 minutes
    return () => clearInterval(interval);
  }, []);
}

export const useSyncRedisToSupabase = () => {
  useEffect(() => {
    console.log("Syncing Redis to Supabase");
    syncRedisToSupabase();

    const interval = setInterval(syncRedisToSupabase, REDIS_CACHE_TIME); // 10 minutes
    return () => clearInterval(interval);
  }, []);
};
