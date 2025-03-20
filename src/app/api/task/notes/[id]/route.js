import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;

  const { data: item, error } = await supabaseClient
    .from("notes")
    .select("*")
    .eq("task_id", id.toString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(item, { status: 200 });
}
