"use client";
import React from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  return <div>Notes {slug}</div>;
}
