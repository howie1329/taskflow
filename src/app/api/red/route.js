import { NextResponse } from "next/server";
import { createClient } from "redis";

export async function GET() {
  console.log("Redis Start");
  const client = createClient({
    username: "default",
    password: process.env.REDIS_PASS,
    socket: {
      host: process.env.REDIS_URL,
      port: process.env.REDIS_PORT,
    },
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  await client.set("foo", "bar");
  const result = await client.get("foo");
  console.log(result); // >>> bar

  await client.setEx("foo", 10, JSON.stringify({ status: "Works" }));

  return NextResponse.json("Success", { status: 200 });
}
