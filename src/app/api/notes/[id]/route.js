import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;

  const { data: item, error } = await supabaseClient
    .from("notes")
    .select("*")
    .eq("id", id.toString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(item[0], { status: 200 });
}
