import "server-only"
import { Daytona } from "@daytonaio/sdk"
import { posix as pathPosix } from "node:path"

type ParsedGitHubRepo = {
  repoUrl: string
  clonePath: string
}

type ThreadSandboxRef = {
  sandboxId: string
  repoUrl: string
  clonePath?: string
}

type RepoCommandResult = {
  exitCode: number
  stdout: string
  truncated: boolean
}

type RepoListEntry = {
  path: string
  type: "file" | "directory" | "other"
}

type RepoSearchMatch = {
  path: string
  line: number
  preview: string
}

type ReadCommandInput =
  | { command: "pwd" }
  | { command: "git_status" }
  | { command: "git_log"; limit?: number }
  | { command: "ls"; path?: string }
  | { command: "find"; path?: string; depth?: number; limit?: number }
  | { command: "cat"; path: string }
  | { command: "head"; path: string; lines?: number }
  | { command: "sed"; path: string; startLine?: number; endLine?: number }
  | { command: "rg"; query: string; path?: string; limit?: number }

const GITHUB_HOSTS = new Set(["github.com", "www.github.com"])
const MAX_LIST_LIMIT = 200
const MAX_SEARCH_LIMIT = 100
const MAX_OUTPUT_CHARS = 12000
const MAX_HEAD_LINES = 200
const MAX_FIND_DEPTH = 5

const sanitizeSegment = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")

export const parseGitHubRepoUrl = (value: string): ParsedGitHubRepo => {
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new Error("Enter a valid GitHub repository URL.")
  }

  if (url.protocol !== "https:") {
    throw new Error("GitHub repository URLs must use HTTPS.")
  }

  if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error("Only public GitHub repository URLs are supported.")
  }

  const segments = url.pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)

  if (segments.length !== 2) {
    throw new Error("Enter a repository URL in the format https://github.com/owner/repo.")
  }

  const owner = sanitizeSegment(segments[0])
  const rawRepo = segments[1].replace(/\.git$/i, "")
  const repo = sanitizeSegment(rawRepo)

  if (!owner || !repo) {
    throw new Error("Enter a valid GitHub repository URL.")
  }

  return {
    repoUrl: `https://github.com/${owner}/${repo}`,
    clonePath: `/home/daytona/${owner}-${repo}`,
  }
}

const createDaytonaClient = () => {
  const apiKey = process.env.DAYTONA_API_KEY
  if (!apiKey) {
    throw new Error("DAYTONA_API_KEY is not configured.")
  }

  return new Daytona({
    apiKey,
    apiUrl: process.env.DAYTONA_API_URL,
    target: process.env.DAYTONA_TARGET,
  })
}

const shellQuote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`

const truncateOutput = (value: string, maxChars = MAX_OUTPUT_CHARS) => {
  if (value.length <= maxChars) {
    return {
      text: value,
      truncated: false,
    }
  }

  return {
    text: `${value.slice(0, maxChars - 1)}…`,
    truncated: true,
  }
}

const normalizeRepoPath = (value?: string) => {
  const trimmed = value?.trim()
  if (!trimmed || trimmed === ".") {
    return "."
  }

  if (trimmed.startsWith("/")) {
    throw new Error("Use repo-relative paths only.")
  }

  const normalized = pathPosix.normalize(trimmed)
  if (normalized === ".." || normalized.startsWith("../")) {
    throw new Error("Path must stay inside the cloned repository.")
  }

  return normalized.replace(/\/$/, "") || "."
}

const resolveRepoRoot = ({ repoUrl, clonePath }: Omit<ThreadSandboxRef, "sandboxId">) =>
  clonePath ?? parseGitHubRepoUrl(repoUrl).clonePath

const getSandbox = async (sandboxId: string) => {
  const daytona = createDaytonaClient()
  return daytona.get(sandboxId)
}

const executeInRepo = async ({
  sandboxId,
  repoUrl,
  clonePath,
  command,
  timeout = 30,
}: ThreadSandboxRef & {
  command: string
  timeout?: number
}) => {
  const sandbox = await getSandbox(sandboxId)
  const repoRoot = resolveRepoRoot({ repoUrl, clonePath })
  const result = await sandbox.process.executeCommand(command, repoRoot, undefined, timeout)

  return {
    exitCode: result.exitCode,
    stdout: result.artifacts?.stdout ?? result.result ?? "",
  }
}

export const createSandboxAndCloneRepo = async (repoUrl: string) => {
  const parsedRepo = parseGitHubRepoUrl(repoUrl)
  const daytona = createDaytonaClient()
  const sandbox = await daytona.create({
    language: "typescript",
  })

  await sandbox.git.clone(parsedRepo.repoUrl, parsedRepo.clonePath)

  return {
    sandboxId: sandbox.id,
    repoUrl: parsedRepo.repoUrl,
    clonePath: parsedRepo.clonePath,
  }
}

export const getSandboxStatus = async (sandboxId: string) => {
  const sandbox = await getSandbox(sandboxId)
  return sandbox.state ?? null
}

export const stopSandbox = async (sandboxId: string) => {
  const sandbox = await getSandbox(sandboxId)
  await sandbox.stop()
}

export const startSandbox = async (sandboxId: string) => {
  const sandbox = await getSandbox(sandboxId)
  await sandbox.start()
}

export const deleteSandbox = async (sandboxId: string) => {
  const sandbox = await getSandbox(sandboxId)
  await sandbox.delete(60)
}

export const resolveThreadRepoRoot = ({
  repoUrl,
  clonePath,
}: Omit<ThreadSandboxRef, "sandboxId">) => resolveRepoRoot({ repoUrl, clonePath })

export const listSandboxRepoFiles = async ({
  sandboxId,
  repoUrl,
  clonePath,
  path,
  limit = 100,
}: ThreadSandboxRef & {
  path?: string
  limit?: number
}) => {
  const targetPath = normalizeRepoPath(path)
  const cappedLimit = Math.min(Math.max(limit, 1), MAX_LIST_LIMIT)
  const { stdout } = await executeInRepo({
    sandboxId,
    repoUrl,
    clonePath,
    command: `find ${shellQuote(targetPath)} -mindepth 1 -maxdepth 1 -printf '%y\t%p\n'`,
  })

  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const entries: RepoListEntry[] = lines.slice(0, cappedLimit).map((line) => {
    const [kind, repoPath] = line.split("\t")
    return {
      path: repoPath.replace(/^\.\//, ""),
      type: kind === "d" ? "directory" : kind === "f" ? "file" : "other",
    }
  })

  return {
    entries,
    truncated: lines.length > cappedLimit,
  }
}

export const searchSandboxRepo = async ({
  sandboxId,
  repoUrl,
  clonePath,
  query,
  path,
  limit = 20,
}: ThreadSandboxRef & {
  query: string
  path?: string
  limit?: number
}) => {
  const targetPath = normalizeRepoPath(path)
  const cappedLimit = Math.min(Math.max(limit, 1), MAX_SEARCH_LIMIT)
  const { stdout } = await executeInRepo({
    sandboxId,
    repoUrl,
    clonePath,
    command: `rg --line-number --no-heading --color never --smart-case ${shellQuote(query)} -- ${shellQuote(targetPath)} | head -n ${cappedLimit + 1}`,
  })

  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const matches: RepoSearchMatch[] = []
  for (const line of lines.slice(0, cappedLimit)) {
    const match = line.match(/^(.*?):(\d+):(.*)$/)
    if (!match) {
      continue
    }

    matches.push({
      path: match[1].replace(/^\.\//, ""),
      line: Number(match[2]),
      preview: match[3].trim(),
    })
  }

  return {
    matches,
    truncated: lines.length > cappedLimit,
  }
}

export const readSandboxRepoFile = async ({
  sandboxId,
  repoUrl,
  clonePath,
  path,
  startLine = 1,
  endLine,
}: ThreadSandboxRef & {
  path: string
  startLine?: number
  endLine?: number
}) => {
  const filePath = normalizeRepoPath(path)
  if (filePath === ".") {
    throw new Error("Choose a file path inside the repo.")
  }

  const firstLine = Math.max(1, Math.floor(startLine))
  const lastLine = Math.max(firstLine, Math.floor(endLine ?? firstLine + 199))
  const { exitCode, stdout } = await executeInRepo({
    sandboxId,
    repoUrl,
    clonePath,
    command: `sed -n '${firstLine},${lastLine}p' -- ${shellQuote(filePath)}`,
  })
  const truncated = truncateOutput(stdout)

  return {
    path: filePath,
    startLine: firstLine,
    endLine: lastLine,
    content: truncated.text,
    exitCode,
    truncated: truncated.truncated,
  }
}

export const runSandboxReadCommand = async (
  sandbox: ThreadSandboxRef,
  input: ReadCommandInput,
): Promise<RepoCommandResult> => {
  let command = ""

  switch (input.command) {
    case "pwd":
      command = "pwd"
      break
    case "git_status":
      command = "git status --short"
      break
    case "git_log": {
      const limit = Math.min(Math.max(input.limit ?? 10, 1), 50)
      command = `git log --oneline -n ${limit + 1}`
      break
    }
    case "ls": {
      const targetPath = normalizeRepoPath(input.path)
      command = `ls -la -- ${shellQuote(targetPath)}`
      break
    }
    case "find": {
      const targetPath = normalizeRepoPath(input.path)
      const depth = Math.min(Math.max(input.depth ?? 2, 1), MAX_FIND_DEPTH)
      const limit = Math.min(Math.max(input.limit ?? 50, 1), MAX_LIST_LIMIT)
      command = `find ${shellQuote(targetPath)} -mindepth 1 -maxdepth ${depth} | head -n ${limit + 1}`
      break
    }
    case "cat": {
      const filePath = normalizeRepoPath(input.path)
      command = `cat -- ${shellQuote(filePath)}`
      break
    }
    case "head": {
      const filePath = normalizeRepoPath(input.path)
      const lines = Math.min(Math.max(input.lines ?? 40, 1), MAX_HEAD_LINES)
      command = `head -n ${lines} -- ${shellQuote(filePath)}`
      break
    }
    case "sed": {
      const filePath = normalizeRepoPath(input.path)
      const startLine = Math.max(1, Math.floor(input.startLine ?? 1))
      const endLine = Math.max(startLine, Math.floor(input.endLine ?? startLine + 39))
      command = `sed -n '${startLine},${endLine}p' -- ${shellQuote(filePath)}`
      break
    }
    case "rg": {
      const targetPath = normalizeRepoPath(input.path)
      const limit = Math.min(Math.max(input.limit ?? 20, 1), MAX_SEARCH_LIMIT)
      command = `rg --line-number --no-heading --color never --smart-case ${shellQuote(input.query)} -- ${shellQuote(targetPath)} | head -n ${limit + 1}`
      break
    }
  }

  const result = await executeInRepo({
    ...sandbox,
    command,
  })
  const truncated = truncateOutput(result.stdout)

  return {
    exitCode: result.exitCode,
    stdout: truncated.text,
    truncated: truncated.truncated,
  }
}
