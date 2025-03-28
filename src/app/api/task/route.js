import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  invalidateAllRedisTask,
  invalidateAllRedisTaskFilters,
} from "@/lib/redisUtils";
import redisClient from "@/app/lib/redisClient";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const client = redisClient;
  if (!client.isOpen) {
    await client.connect();
  }

  const key = `tasks:${userId}`;

  try {
    const cacheAllTask = await client.get(key);
    if (cacheAllTask != null) {
      return NextResponse.json(JSON.parse(cacheAllTask), { status: 200 });
    }
    const { data: item, error } = await supabaseClient
      .from("tasks")
      .select("*")
      .eq("userId", userId)
      .order("position", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (item.length > 0) {
      await client.set(key, JSON.stringify(item), { EX: 600 });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { userId } = await auth();
  const requestedData = await req.json();

  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  requestedData.userId = userId;
  const { data, error } = await supabaseClient
    .from("tasks")
    .insert(requestedData)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    invalidateAllRedisTaskFilters();
    invalidateAllRedisTask();
    return NextResponse.json(data, { status: 201 });
  }
}
