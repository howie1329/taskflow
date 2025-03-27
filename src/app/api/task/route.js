import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const user = await currentUser();
  const { data: item, error } = await supabaseClient
    .from("tasks")
    .select("*")
    .eq("userId", user.id)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(item, { status: 200 });
  }
}

export async function POST(req) {
  const user = await currentUser();
  const requestedData = await req.json();
  requestedData.userId = user.id;
  const { data, error } = await supabaseClient
    .from("tasks")
    .insert(requestedData)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(data, { status: 201 });
  }
}
