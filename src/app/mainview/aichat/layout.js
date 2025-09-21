import React from "react";
import AISidebar from "@/presentation/components/aiChat/layout/AISidebar";

export default function Layout({ children }) {
  return (
    <div className="grid grid-cols-[200px_1fr] h-[96vh]">
      <AISidebar />
      <main className="flex items-center justify-center ">{children}</main>
    </div>
  );
}
