import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";
export async function GET() {
  const { data: item, error } = await supabaseClient
    .from("todos")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(item, { status: 200 });
  }
}

export async function POST(req) {
  const { data: title } = await req.json();
  const { data, error } = await supabaseClient.from("todos").insert(title);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(data, { status: 201 });
  }
}
