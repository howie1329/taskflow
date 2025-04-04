"use client";
import { useEffect } from "react";
import { syncIndexedDBWithRedis } from "../SyncIndexToRedis";
import { syncRedisToSupabase } from "../SyncRedisToSupabase";
import { INDEXEDDB_STALE_TIME, REDIS_STALE_TIME } from "@/lib/constants";

export function useSyncIndexedDBWithRedis() {
  useEffect(() => {
    syncIndexedDBWithRedis();

    const interval = setInterval(syncIndexedDBWithRedis, INDEXEDDB_STALE_TIME); // 6 minutes
    return () => clearInterval(interval);
  }, []);
}

export const useSyncRedisToSupabase = () => {
  useEffect(() => {
    syncRedisToSupabase();

    const interval = setInterval(syncRedisToSupabase, REDIS_STALE_TIME); // 10 minutes
    return () => clearInterval(interval);
  }, []);
};
