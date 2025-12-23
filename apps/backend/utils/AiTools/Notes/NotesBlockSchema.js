import { z } from "zod";

const ContentSchema = z.object({
  text: z.string().describe("The text of the block"),
  type: z.literal("text").describe("The type of the content"),
  style: z
    .enum(["bold", "italic", "underline", "strikethrough", "code", "link"])
    .describe("The style of the content"),
});
const BasePropsSchema = z.object({
  textColor: z.string().describe("The text color of the block"),
  textAlignment: z.string().describe("The text alignment of the block"),
  backgroundColor: z.string().describe("The background color of the block"),
});
const HeadingBlockSchema = z.object({
  level: z.number().describe("The level of the heading"),
  isToggleable: z.boolean().describe("Whether the heading is toggleable"),
});

const CodeBlockSchema = z.object({
  language: z.string().describe("The language of the code"),
});

export const NodeSchema = z.object({
  id: z.string().uuid().describe("The ID of the node"),
  type: z
    .enum([
      "paragraph",
      "heading",
      "blockquote",
      "code",
      "image",
      "video",
      "audio",
      "link",
      "embed",
      "divider",
      "table",
      "row",
      "cell",
    ])
    .describe("The type of the node"),
  props: z.union([CodeBlockSchema, HeadingBlockSchema, BasePropsSchema]),
  content: z.array(ContentSchema).describe("The content of the node"),
});
