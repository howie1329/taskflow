import React from "react";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col bg-card rounded-md border shadow-sm p-2 overflow-hidden h-[93vh] gap-2">
      {children}
    </div>
  );
}
