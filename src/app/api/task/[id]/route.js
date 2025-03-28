import { supabaseClient } from "@/app/lib/supabaseClient";
import {
  invalidateAllRedisTask,
  invalidateAllRedisTaskFilters,
} from "@/lib/redisUtils";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const requestedData = await req.json();

  const { data: item, error } = await supabaseClient
    .from("tasks")
    .update(requestedData)
    .eq("id", id.toString())
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  invalidateAllRedisTaskFilters();
  invalidateAllRedisTask();
  return NextResponse.json(item, { status: 200 });
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  const { error } = await supabaseClient
    .from("tasks")
    .delete()
    .eq("id", id.toString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  invalidateAllRedisTaskFilters();
  invalidateAllRedisTaskFilters();
  return NextResponse.json({ id }, { status: 200 });
}
