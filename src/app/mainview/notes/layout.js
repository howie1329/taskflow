import NotesSideBar from "@/presentation/components/notes/layout/NotesSideBar";
import React from "react";

function Layout({ children }) {
  return (
    <div className="grid grid-cols-[200px_1fr] h-[96vh]">
      <NotesSideBar />
      <main className="flex items-center justify-center ">{children}</main>
    </div>
  );
}

export default Layout;
