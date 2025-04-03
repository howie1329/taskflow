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
    const tasksData = fetchAllTasksRedis(userId);
    if (tasksData != null) {
      return NextResponse.json(JSON.parse(tasksData), { status: 200 });
    }

    const { data: item, error } = await supabaseClient
      .from("tasks")
      .select("*")
      .eq("userId", userId)
      .order("position", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

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
