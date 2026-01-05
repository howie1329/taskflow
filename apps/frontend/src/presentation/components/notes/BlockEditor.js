"use client";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import React, { useMemo } from "react";
import useFetchSingleNote from "@/hooks/notes/useFetchSingleNote";

export default function BlockEditor({ setBlocks, noteId }) {
  const { data: note } = useFetchSingleNote(noteId);

  // Memoize editor to prevent recreation on every render
  const editor = useCreateBlockNote({
    initialContent: note?.blocks,
    // Add custom block types
    blockSpecs: {
      // Add custom blocks here
    },
    // Add slash menu customization
    slashMenuItems: [
      // Custom slash commands
    ],
  });

  // Add auto-save with debouncing
  const handleChange = useMemo(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const currentBlocks = editor.document;
        setBlocks(currentBlocks);
      }, 1000); // Debounce 1 second
    };
  }, [editor, setBlocks]);

  return (
    <div className="h-full overflow-y-auto">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="light" // or "dark" based on your theme
        className="h-full overflow-y-auto"
      />
      <style jsx global>
        {`
          .bn-editor {
            height: 100% !important;
            overflow-y: auto !important;
            border-radius: 0 !important;
            background-color: transparent !important;
            font-size: 12px !important;
          }

          .bn-editor * {
            color: var(--color-foreground) !important;
          }
        `}
      </style>
    </div>
  );
}
