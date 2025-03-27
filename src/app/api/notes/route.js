import { supabaseClient } from "@/app/lib/supabaseClient";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  const { data: item, error } = await supabaseClient
    .from("notes")
    .select("*")
    .eq("userId", user.id)
    .order("created_at", { ascending: false });

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
    .from("notes")
    .insert(requestedData)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(data, { status: 201 });
  }
}
