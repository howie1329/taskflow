"use client";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import React from "react";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  return (
    <div>
      <Button onClick={() => router.back()}>Back</Button>
      Page {id}
    </div>
  );
}
