import { NextResponse } from "next/server";
import redisClient from "@/app/lib/redisClient";

export async function GET() {
  console.log("Redis Start");
  const client = redisClient;

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  await client.set("foo", "bar");
  const result = await client.get("foo");
  console.log(result); // >>> bar

  await client.setEx("foo", 10, JSON.stringify({ status: "Works" }));

  return NextResponse.json("Success", { status: 200 });
}
