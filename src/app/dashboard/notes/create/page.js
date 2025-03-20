import React from "react";
import NotesEditorComponent from "../components/NotesEditorComponent";

const Page = () => {
  return (
    <div className="flex flex-col items-center w-full border-2 border-black">
      <NotesEditorComponent />
    </div>
  );
};

export default Page;
