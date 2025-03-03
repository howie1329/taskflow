import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req) {
  const requestedData = await req.json();
  console.log(requestedData);
  const { data, error } = await supabaseClient
    .from("subTasks")
    .insert(requestedData)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(data, { status: 201 });
  }
}
