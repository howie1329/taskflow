import { z } from "zod"

export const toolProgressSchema = z.object({
  kind: z.literal("tool-progress"),
  message: z.string(),
})

export type ToolProgress = z.infer<typeof toolProgressSchema>

export const toolProgress = (message: string): ToolProgress => ({
  kind: "tool-progress",
  message,
})

export const isToolProgress = (value: unknown): value is ToolProgress => {
  const parsed = toolProgressSchema.safeParse(value)
  return parsed.success
}

export const withToolProgressSchema = <T extends z.ZodTypeAny>(
  finalSchema: T,
) => z.union([toolProgressSchema, finalSchema])
