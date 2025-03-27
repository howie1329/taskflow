import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req, { params }) {
  const user = await currentUser();
  const { filter } = await params;
  const { data: item, error } = await supabaseClient
    .from("tasks")
    .select("*")
    .eq("priority", filter)
    .eq("userId", user.id)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(item, { status: 200 });
  }
}
