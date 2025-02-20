import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const { data: item, error } = await supabaseClient
    .from("todos")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(item, { status: 200 });
  }
}

export async function POST(req) {
  const requestedData = await req.json();
  const { data, error } = await supabaseClient
    .from("todos")
    .insert(requestedData);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(data, { status: 201 });
  }
}
