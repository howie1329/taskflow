import NotesSideBar from "@/presentation/components/notes/layout/NotesSideBar";
import React from "react";

function Layout({ children }) {
  return (
    <div className="grid grid-cols-[150px_1fr] min-h-screen gap-2">
      <NotesSideBar />
      <main className="p-4">{children}</main>
    </div>
  );
}

export default Layout;
