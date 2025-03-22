import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { filter } = await params;
  const { data: item, error } = await supabaseClient
    .from("tasks")
    .select("*")
    .eq("priority", filter)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(item, { status: 200 });
  }
}
