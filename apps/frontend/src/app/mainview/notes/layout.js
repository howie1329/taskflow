import NotesSideBar from "@/presentation/components/notes/layout/NotesSideBar";
import React from "react";

function Layout({ children }) {
  return (
    <div className="grid grid-cols-[200px_1fr] h-full overflow-hidden">
      <NotesSideBar />
      <main className="h-full overflow-hidden">{children}</main>
    </div>
  );
}

export default Layout;
