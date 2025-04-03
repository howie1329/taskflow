import { supabaseClient } from "@/app/lib/supabaseClient";
import {
  invalidateAllRedisTask,
  invalidateAllRedisTaskFilters,
} from "@/lib/redisUtils";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  const { id } = await params;
  const requestedData = await req.json();
  try {
    await invalidateAllRedisTask(userId);
    invalidateAllRedisTaskFilters(userId);
    const { data: item, error } = await supabaseClient
      .from("tasks")
      .update(requestedData)
      .eq("id", id.toString())
      .select();

    if (error) {
      throw new Error(error.message);
    }
    console.log("Update: ", item[0]);
    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { userId } = await auth();
  const { id } = await params;

  const { error } = await supabaseClient
    .from("tasks")
    .delete()
    .eq("id", id.toString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  invalidateAllRedisTaskFilters(userId);
  invalidateAllRedisTask(userId);
  return NextResponse.json({ id }, { status: 200 });
}
