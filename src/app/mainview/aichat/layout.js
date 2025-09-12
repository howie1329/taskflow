"use client";
import React from "react";
import AISidebar from "@/presentation/components/aiChat/layout/AISidebar";

export default function Layout({ children }) {
  return (
    <div className="grid grid-cols-[150px_1fr] h-[93vh] gap-2">
      <AISidebar />
      <main className="flex items-center justify-center">{children}</main>
    </div>
  );
}
