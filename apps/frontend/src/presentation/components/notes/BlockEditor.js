"use client";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import React from "react";
import useFetchSingleNote from "@/hooks/notes/useFetchSingleNote";

export default function BlockEditor({ setBlocks, noteId }) {
  const { data: note } = useFetchSingleNote(noteId);
  const editor = useCreateBlockNote({
    initialContent: note?.blocks,
  });

  return (
    <div className="h-full overflow-y-auto">
      <BlockNoteView
        editor={editor}
        onChange={() => {
          const currentBlocks = editor.document;
          setBlocks(currentBlocks);
        }}
        className="h-full overflow-y-auto"
      />
      <style jsx global>
        {`
          .bn-editor {
            height: 100% !important;
            overflow-y: auto !important;
          }
        `}
      </style>
    </div>
  );
}
