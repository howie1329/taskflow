import NotesSideBar from "@/presentation/components/notes/layout/NotesSideBar";
import React from "react";

function Layout({ children }) {
  return (
    <div className="grid grid-cols-[200px_1fr] h-full">
      <NotesSideBar />
      <main className="">{children}</main>
    </div>
  );
}

export default Layout;
