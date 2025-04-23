import React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const Options = [
    {
      group: "Headings",
      items: [
        {
          icon: <Heading1 className="h-4 w-4" />,
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
          pressed: editor.isActive("heading", { level: 1 }),
          tooltip: "Heading 1",
        },
        {
          icon: <Heading2 className="h-4 w-4" />,
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
          pressed: editor.isActive("heading", { level: 2 }),
          tooltip: "Heading 2",
        },
        {
          icon: <Heading3 className="h-4 w-4" />,
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
          pressed: editor.isActive("heading", { level: 3 }),
          tooltip: "Heading 3",
        },
      ],
    },
    {
      group: "Text Style",
      items: [
        {
          icon: <Bold className="h-4 w-4" />,
          onClick: () => editor.chain().focus().toggleBold().run(),
          pressed: editor.isActive("bold"),
          tooltip: "Bold",
        },
        {
          icon: <Italic className="h-4 w-4" />,
          onClick: () => editor.chain().focus().toggleItalic().run(),
          pressed: editor.isActive("italic"),
          tooltip: "Italic",
        },
        {
          icon: <Strikethrough className="h-4 w-4" />,
          onClick: () => editor.chain().focus().toggleStrike().run(),
          pressed: editor.isActive("strike"),
          tooltip: "Strikethrough",
        },
        {
          icon: <Highlighter className="h-4 w-4" />,
          onClick: () => editor.chain().focus().toggleHighlight().run(),
          pressed: editor.isActive("highlight"),
          tooltip: "Highlight",
        },
      ],
    },
    {
      group: "Alignment",
      items: [
        {
          icon: <AlignLeft className="h-4 w-4" />,
          onClick: () => editor.chain().focus().setTextAlign("left").run(),
          pressed: editor.isActive({ textAlign: "left" }),
          tooltip: "Align Left",
        },
        {
          icon: <AlignCenter className="h-4 w-4" />,
          onClick: () => editor.chain().focus().setTextAlign("center").run(),
          pressed: editor.isActive({ textAlign: "center" }),
          tooltip: "Align Center",
        },
        {
          icon: <AlignRight className="h-4 w-4" />,
          onClick: () => editor.chain().focus().setTextAlign("right").run(),
          pressed: editor.isActive({ textAlign: "right" }),
          tooltip: "Align Right",
        },
      ],
    },
    {
      group: "Lists",
      items: [
        {
          icon: <List className="h-4 w-4" />,
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          pressed: editor.isActive("bulletList"),
          tooltip: "Bullet List",
        },
        {
          icon: <ListOrdered className="h-4 w-4" />,
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          pressed: editor.isActive("orderedList"),
          tooltip: "Numbered List",
        },
      ],
    },
  ];

  return (
    <div className="flex items-center gap-2 p-2">
      {Options.map((group, groupIndex) => (
        <React.Fragment key={group.group}>
          {groupIndex > 0 && (
            <Separator orientation="vertical" className="h-6" />
          )}
          <div className="flex items-center gap-1">
            {group.items.map((option, index) => (
              <Toggle
                key={index}
                pressed={option.pressed}
                onPressedChange={option.onClick}
                size="sm"
                className="h-8 w-8"
                title={option.tooltip}
              >
                {option.icon}
              </Toggle>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default MenuBar;
