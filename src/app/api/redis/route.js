import { NextResponse } from "next/server";
import {
  fetchAllTasksRedis,
  invalidateAllRedisTask,
  setAllTaskRedis,
} from "@/lib/redisUtils";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    const task = await fetchAllTasksRedis(userId);
    console.log(
      "Fetching tasks from Redis in API route : api/redis",
      JSON.parse(task)
    );
    if (task.length > 0) {
      return NextResponse.json(JSON.parse(task), { status: 200 });
    }
    return NextResponse.json([], { status: 200 });
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { userId } = await auth();
  const newTask = await req.json();
  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }
  try {
    await invalidateAllRedisTask(userId);
    await setAllTaskRedis(userId, newTask);
    console.log("Task added to Redis successfully");
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
