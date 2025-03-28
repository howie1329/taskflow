import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import redisClient from "@/app/lib/redisClient";

export async function GET(req, { params }) {
  const today = new Date().toISOString().split("T")[0];
  const { userId } = await auth();
  const { filter } = await params;

  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const client = redisClient;
  if (!client.isOpen) {
    await client.connect();
  }

  const key = `tasks:${userId}:today:${today}:filter:${filter}`;

  try {
    const cacheFilterTask = await client.get(key);
    if (cacheFilterTask != null) {
      return NextResponse.json(JSON.parse(cacheFilterTask), { status: 200 });
    }
    const { data: item, error } = await supabaseClient
      .from("tasks")
      .select("*")
      .eq("priority", filter)
      .eq("userId", userId)
      .eq("date", today)
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
