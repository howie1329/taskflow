import "server-only"
import { Daytona } from "@daytonaio/sdk"

type ParsedGitHubRepo = {
  repoUrl: string
  clonePath: string
}

const GITHUB_HOSTS = new Set(["github.com", "www.github.com"])

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
  const daytona = createDaytonaClient()
  const sandbox = await daytona.get(sandboxId)
  return sandbox.state ?? null
}

export const stopSandbox = async (sandboxId: string) => {
  const daytona = createDaytonaClient()
  const sandbox = await daytona.get(sandboxId)
  await sandbox.stop()
}

export const startSandbox = async (sandboxId: string) => {
  const daytona = createDaytonaClient()
  const sandbox = await daytona.get(sandboxId)
  await sandbox.start()
}

export const deleteSandbox = async (sandboxId: string) => {
  const daytona = createDaytonaClient()
  const sandbox = await daytona.get(sandboxId)
  await sandbox.delete(60)
}
