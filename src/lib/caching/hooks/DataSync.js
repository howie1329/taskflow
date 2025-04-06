"use client";
import { useAuth } from "@clerk/nextjs";
import React, { useEffect } from "react";
import { redisSync } from "../SyncIndexedDbToRedis";
import { INDEXEDDB_STALE_TIME, REDIS_CACHE_TIME } from "@/lib/constants";
import { syncRedisToSupabase } from "../SyncRedisToSupabase";

export const useRedisToIndexedDb = () => {
  const { getToken } = useAuth();
  useEffect(() => {
    const runSync = () => {
      redisSync(getToken);
    };
    runSync();

    const interval = setInterval(() => {
      runSync;
    }, INDEXEDDB_STALE_TIME);
    return () => clearInterval(interval);
  }, [getToken]);
};

export const useRedisToSupabaseSync = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    const runSync = () => {
      syncRedisToSupabase(getToken);
    };
    runSync();

    const interval = setInterval(runSync, REDIS_CACHE_TIME);
    return () => clearInterval(interval);
  }, [getToken]);
};
