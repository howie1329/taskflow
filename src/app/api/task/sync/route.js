import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }
  try {
    const { data: item, error } = await supabaseClient
      .from("tasks")
      .select("*")
      .eq("userId", userId)
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
