import { z } from "zod"

export const repoFileSchema = z.object({
  path: z.string(),
  type: z.enum(["file", "directory", "other"]),
})

export const repoSearchMatchSchema = z.object({
  path: z.string(),
  line: z.number(),
  preview: z.string(),
})

export const listRepoFilesOutputSchema = z.object({
  files: z.array(repoFileSchema),
  truncated: z.boolean(),
  message: z.string(),
})

export const searchRepoOutputSchema = z.object({
  matches: z.array(repoSearchMatchSchema),
  truncated: z.boolean(),
  message: z.string(),
})

export const readRepoFileOutputSchema = z.object({
  path: z.string().nullable(),
  content: z.string(),
  startLine: z.number().nullable(),
  endLine: z.number().nullable(),
  truncated: z.boolean(),
  message: z.string(),
})

export const runReadCommandInputSchema = z.object({
  command: z.enum(["pwd", "git_status", "git_log", "ls", "find", "cat", "head", "sed", "rg"]),
  path: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  depth: z.number().int().min(1).max(5).optional(),
  lines: z.number().int().min(1).max(200).optional(),
  startLine: z.number().int().min(1).optional(),
  endLine: z.number().int().min(1).optional(),
})

export const runReadCommandOutputSchema = z.object({
  command: z.string(),
  exitCode: z.number().nullable(),
  stdout: z.string(),
  truncated: z.boolean(),
  message: z.string(),
  path: z.string().nullable().optional(),
  startLine: z.number().nullable().optional(),
  endLine: z.number().nullable().optional(),
})

export type RunReadCommandInput = z.infer<typeof runReadCommandInputSchema>

export function normalizeRunReadCommandInput(input: RunReadCommandInput) {
  switch (input.command) {
    case "pwd":
    case "git_status":
      return { command: input.command } as const
    case "git_log":
      return { command: input.command, limit: input.limit } as const
    case "ls":
      return { command: input.command, path: input.path } as const
    case "find":
      return {
        command: input.command,
        path: input.path,
        query: input.query,
        depth: input.depth,
        limit: input.limit,
      } as const
    case "cat":
      return {
        command: input.command,
        path: input.path,
        startLine: input.startLine,
        endLine: input.endLine,
      } as const
    case "head":
      return {
        command: input.command,
        path: input.path,
        lines: input.lines,
      } as const
    case "sed":
      return {
        command: input.command,
        path: input.path,
        query: input.query,
        startLine: input.startLine,
        endLine: input.endLine,
      } as const
    case "rg":
      return {
        command: input.command,
        path: input.path,
        query: input.query,
        limit: input.limit,
      } as const
    default:
      return input
  }
}
