import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const { data: item, error } = await supabaseClient
    .from("tasks")
    .select("*")
    .order("date", { ascending: true });

  for (let i = 0; i < item.length; i++) {
    const { data: subTask, error } = await supabaseClient
      .from("subTasks")
      .select("*")
      .eq("task_id", item[i].id);
    item[i].subTasks = [...subTask];
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(item, { status: 200 });
  }
}

export async function POST(req) {
  const requestedData = await req.json();
  const { data, error } = await supabaseClient
    .from("tasks")
    .insert(requestedData);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(data, { status: 201 });
  }
}
