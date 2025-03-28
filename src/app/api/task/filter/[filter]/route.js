import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req, { params }) {
  const today = new Date().toISOString().split("T")[0];
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const { filter } = await params;
  const { data: item, error } = await supabaseClient
    .from("tasks")
    .select("*")
    .eq("priority", filter)
    .eq("userId", userId)
    .eq("date", today)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(item, { status: 200 });
  }
}
