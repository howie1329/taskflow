import { NextResponse } from "next/server";
import redisClient from "@/app/lib/redisClient";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  console.log("Redis Start");
  const client = redisClient;

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  //await client.set("foo", "bar");
  const key = `tasks:user_2usb0Md2SjCvMehu1XHJBN2y03c:today:${today}:filter:None`;
  const result = await client.get(key);

  if (!result) {
    console.log(`Key "${key}" does not exist in Redis.`);
  } else {
    console.log(result); // >>> bar
  }
  console.log(result); // >>> bar

  await client.set("foo", 10);

  client.disconnect();

  return NextResponse.json("Success", { status: 200 });
}
