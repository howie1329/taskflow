"use client";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import Tiptap from "./TipTap";
import { Button } from "@/components/ui/button";
import useUploadNote from "@/hooks/useUploadNote";
import { useRouter } from "next/navigation";

const NotesEditorComponent = () => {
  const router = useRouter();
  const upload = useUploadNote();
  const [noteTitle, setNoteTitle] = useState();
  const [note, setNote] = useState();
  const onChange = (content) => {
    setNote(content);
  };

  const onClick = () => {
    const noteData = {
      title: noteTitle,
      description: "Note Description",
      content: note,
    };
    upload(noteData);
    router.push("/dashboard/notes");
  };
  return (
    <div className="flex flex-col w-3/4 gap-2">
      <Input
        placeholder={"Note Title...."}
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
      />
      <Tiptap content={content} onChange={onChange} />
      <Button onClick={onClick}>Save</Button>
    </div>
  );
};

export default NotesEditorComponent;
