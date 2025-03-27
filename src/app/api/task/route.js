import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const { data: item, error } = await supabaseClient
    .from("tasks")
    .select("*")
    .eq("userId", userId)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(item, { status: 200 });
  }
}

export async function POST(req) {
  const { userId } = await auth();
  const requestedData = await req.json();

  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  requestedData.userId = userId;
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
