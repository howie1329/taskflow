"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./MenuBar";
import TextAlign from "@tiptap/extension-text-align";
import { cn } from "@/lib/utils";

const Tiptap = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-6",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-6",
          },
        },
        heading: {
          HTMLAttributes: {
            class: "font-semibold",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl",
          "prose-headings:font-semibold",
          "prose-p:leading-relaxed",
          "prose-pre:bg-muted",
          "prose-strong:font-semibold",
          "prose-em:italic",
          "prose-code:rounded-md prose-code:bg-muted prose-code:px-1 prose-code:py-0.5",
          "prose-blockquote:border-l-2 prose-blockquote:border-muted prose-blockquote:pl-4",
          "prose-ul:list-disc prose-ul:ml-6",
          "prose-ol:list-decimal prose-ol:ml-6",
          "prose-li:marker:text-muted-foreground",
          "prose-img:rounded-md",
          "prose-hr:border-muted",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "focus:outline-none min-h-[500px] p-4"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="flex flex-col w-full">
      <div className="sticky top-0 z-10 bg-background border-b">
        <MenuBar editor={editor} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
