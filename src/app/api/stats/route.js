import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    console.log(userId);
    const today = new Date().toISOString().slice(0, 10);

    const [total, completed, overdue] = await Promise.all([
      await supabaseClient
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("userId", userId),
      await supabaseClient
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("userId", userId)
        .eq("isCompleted", "TRUE"),
      await supabaseClient
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("userId", userId)
        .lt("date", today)
        .neq("isCompleted", "TRUE"),
    ]);

    const data = {
      Total: total.count,
      Completed: completed.count,
      Overdue: overdue.count,
    };

    console.log(data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
