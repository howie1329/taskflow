import { supabaseClient } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const requestedData = await req.json();

  const { data: item, error } = await supabaseClient
    .from("todos")
    .update(requestedData)
    .eq("id", id.toString())
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(item, { status: 200 });
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  const { error } = await supabaseClient
    .from("todos")
    .delete()
    .eq("id", id.toString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id }, { status: 200 });
}
