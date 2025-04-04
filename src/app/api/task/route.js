import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  fetchAllTasksRedis,
  invalidateAllRedisTask,
  invalidateAllRedisTaskFilters,
  setAllTaskRedis,
} from "@/lib/redisUtils";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    console.log("Fetching tasks from Redis in API route");
    const tasksData = await fetchAllTasksRedis(userId);
    if (tasksData.length > 0) {
      return NextResponse.json(JSON.parse(tasksData), { status: 200 });
    }
    console.log("Fetching tasks from Supabase in API route");
    const { data: item, error } = await supabaseClient
      .from("tasks")
      .select("*")
      .eq("userId", userId)
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    console.log("Fetching tasks from Supabase in API route adding to Redis");
    await setAllTaskRedis(userId, item);

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
    invalidateAllRedisTaskFilters(userId);
    await invalidateAllRedisTask(userId);
    return NextResponse.json(data, { status: 201 });
  }
}
