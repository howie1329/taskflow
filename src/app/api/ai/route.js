import model from "@/app/lib/googleAIClient";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  const requestedData = await req.json();
  const result = await model.generateContent(requestedData.prompt);
  console.log(result.response.text());
  return NextResponse.json({ result });
}
