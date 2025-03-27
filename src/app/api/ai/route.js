import model from "@/app/lib/googleAIClient";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req, res) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }
  const requestedData = await req.json();
  const result = await model.generateContent(requestedData.prompt);
  const resultText = result.response.text();
  const resultData = JSON.parse(resultText);
  console.log(resultData);
  return NextResponse.json(resultData, { status: 200 });
}
