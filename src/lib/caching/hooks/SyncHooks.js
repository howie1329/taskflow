"use client";
import { useEffect } from "react";
import { syncIndexedDBWithRedis } from "../SyncIndexToRedis";
import { syncRedisToSupabase } from "../SyncRedisToSupabase";

export function useSyncIndexedDBWithRedis() {
  useEffect(() => {
    syncIndexedDBWithRedis();

    const interval = setInterval(syncIndexedDBWithRedis, 6 * 60 * 1000); // 6 minutes
    return () => clearInterval(interval);
  }, []);
}

export const useSyncRedisToSupabase = () => {
  useEffect(() => {
    syncRedisToSupabase();

    const interval = setInterval(syncRedisToSupabase, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, []);
};
