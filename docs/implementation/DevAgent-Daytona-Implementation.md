# DevAgent Mode Implementation Plan

## Overview

Add a new "DevAgent" mode that uses Daytona sandboxes to give the AI agent the ability to make changes to GitHub repositories. The agent can clone repos, execute commands, modify files, and push commits—all within isolated, ephemeral sandboxes.

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (app/web)                       │
├─────────────────────────────────────────────────────────────────┤
│  • Mode selector → "DevAgent" option                            │
│  • Repo selector → GitHub OAuth connected repos                │
│  • Sandbox status badge → stopped/starting/running indicator   │
│  • Terminal output → reuse existing Terminal.tsx                │
│  • Git confirmations → modal before push operations             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Convex Backend                           │
├─────────────────────────────────────────────────────────────────┤
│  convex/daytona/                                                 │
│  ├── config.ts          → Daytona SDK initialization           │
│  ├── sandbox.ts         → Lifecycle + idle timeout worker       │
│  ├── git.ts            → Git operations wrapper                │
│  └── fs.ts             → File system operations                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Daytona Cloud                             │
├─────────────────────────────────────────────────────────────────┤
│  • Sandbox management (create/destroy)                          │
│  • Git operations (clone, branch, commit, push)                 │
│  • Command execution (dependency installation, npm, etc.)       │
│  • File system operations (read, write, list)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: GitHub Integration

### 1.1 Add GitHub OAuth to Convex Auth

**File:** `convex/auth.ts` or existing auth configuration

```typescript
// Add GitHub provider
import { convexAuth } from "@convex-dev/auth";
import { GitHub } from "@convex-dev/auth/providers";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // ... existing providers
  ],
});
```

### 1.2 Store GitHub Access Token

**File:** `convex/daytona/github.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store GitHub access token for user
export const storeGitHubToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.patch("users", identity.subject, {
      githubAccessToken: args.token,
    });
  },
});

// Get user's GitHub access token
export const getGitHubToken = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db.table("users").get(identity.subject);
    return user?.githubAccessToken ?? null;
  },
});
```

### 1.3 Create Repo Picker UI

**File:** `apps/web/components/ai-elements/github-repo-selector.tsx`

```typescript
"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Github, Loader2 } from "lucide-react"
import { useState } from "react"

interface Repo {
  id: number
  name: string
  full_name: string
  html_url: string
  default_branch: string
}

export function GitHubRepoSelector({
  onSelect: (repo: Repo) => void,
}) {
  const [open, setOpen] = useState(false)
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  // Fetch user's GitHub repos via Convex
  const fetchRepos = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/github/repos")
      const data = await response.json()
      setRepos(data)
    } catch (error) {
      console.error("Failed to fetch repos:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      setOpen(open)
      if (open) fetchRepos()
    }}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-muted">
          <Github className="w-4 h-4" />
          <span>Select Repository</span>
        </button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogTitle className="sr-only">Select Repository</DialogTitle>
        <Command>
          <CommandInput
            placeholder="Search repositories..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
            <CommandEmpty>No repositories found</CommandEmpty>
            <CommandGroup heading="Your Repositories">
              {repos.map((repo) => (
                <CommandItem
                  key={repo.id}
                  onSelect={() => {
                    onSelect(repo)
                    setOpen(false)
                  }}
                >
                  <div className="flex flex-col">
                    <span>{repo.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {repo.full_name}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
```

## Phase 2: Daytona Backend

### 2.1 SDK Configuration

**File:** `convex/daytona/config.ts`

```typescript
import { Daytona } from "@daytonaio/sdk";

export const daytona = new Daytona({
  apiKey: process.env.DAYTONA_API_KEY!,
  apiUrl: process.env.DAYTONA_API_URL ?? "https://app.daytona.io/api",
});
```

### 2.2 Sandbox Lifecycle

**File:** `convex/daytona/sandbox.ts`

```typescript
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { daytona } from "./config";
import { api as convexApi } from "./_generated/api";

// Create a new sandbox
export const createSandbox = mutation({
  args: {
    repoUrl: v.string(),
    branch: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const sandbox = await daytona.create({
      image: {
        os: "ubuntu",
      },
    });

    // Clone repository
    await sandbox.toolbox.executeCommand({
      cmd: `git clone ${args.repoUrl} workspace`,
    });

    if (args.branch) {
      await sandbox.toolbox.executeCommand({
        cmd: `cd workspace && git checkout ${args.branch}`,
      });
    }

    // Store sandbox info
    const sandboxId = await ctx.db.insert("daytonaSandboxes", {
      userId: identity.subject,
      daytonaSandboxId: sandbox.id,
      repoUrl: args.repoUrl,
      branch: args.branch ?? "main",
      createdAt: Date.now(),
      lastActivity: Date.now(),
      status: "running",
    });

    return sandboxId;
  },
});

// Execute command in sandbox
export const execute = mutation({
  args: {
    sandboxId: v.id("daytonaSandboxes"),
    command: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox || sandbox.userId !== identity.subject) {
      throw new Error("Sandbox not found");
    }

    // Get sandbox from Daytona
    const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);

    // Update last activity
    await ctx.db.patch(args.sandboxId, { lastActivity: Date.now() });

    // Execute command
    const result = await daytonaSandbox.toolbox.executeCommand({
      cmd: args.command,
    });

    return result.stdout ?? result.stderr;
  },
});

// Read file from sandbox
export const readFile = mutation({
  args: {
    sandboxId: v.id("daytonaSandboxes"),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox || sandbox.userId !== identity.subject) {
      throw new Error("Sandbox not found");
    }

    const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);
    await ctx.db.patch(args.sandboxId, { lastActivity: Date.now() });

    try {
      const content = await daytonaSandbox.fs.downloadFile(args.path);
      return content.toString();
    } catch {
      return null;
    }
  },
});

// Write file to sandbox
export const writeFile = mutation({
  args: {
    sandboxId: v.id("daytonaSandboxes"),
    path: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox || sandbox.userId !== identity.subject) {
      throw new Error("Sandbox not found");
    }

    const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);
    await ctx.db.patch(args.sandboxId, { lastActivity: Date.now() });

    await daytonaSandbox.fs.uploadFile(Buffer.from(args.content), args.path);

    return true;
  },
});

// Destroy sandbox
export const destroy = mutation({
  args: { sandboxId: v.id("daytonaSandboxes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox || sandbox.userId !== identity.subject) {
      throw new Error("Sandbox not found");
    }

    const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);
    await daytonaSandbox.delete();
    await ctx.db.delete(args.sandboxId);

    return true;
  },
});

// Get sandbox status
export const getStatus = query({
  args: { sandboxId: v.id("daytonaSandboxes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox || sandbox.userId !== identity.subject) {
      return null;
    }

    return {
      status: sandbox.status,
      lastActivity: sandbox.lastActivity,
      repoUrl: sandbox.repoUrl,
      branch: sandbox.branch,
    };
  },
});
```

### 2.3 Git Operations

**File:** `convex/daytona/git.ts`

```typescript
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { daytona } from "./config";

export const gitClone = mutation({
  args: {
    sandboxId: v.id("daytonaSandboxes"),
    repoUrl: v.string(),
    branch: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox) throw new Error("Sandbox not found");

    const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);

    await daytonaSandbox.toolbox.executeCommand({
      cmd: `rm -rf workspace`,
    });

    await daytonaSandbox.toolbox.executeCommand({
      cmd: `git clone ${args.repoUrl} workspace`,
    });

    if (args.branch) {
      await daytonaSandbox.toolbox.executeCommand({
        cmd: `cd workspace && git checkout ${args.branch}`,
      });
    }

    await ctx.db.patch(args.sandboxId, {
      lastActivity: Date.now(),
      repoUrl: args.repoUrl,
      branch: args.branch ?? "main",
    });

    return true;
  },
});

export const gitCheckout = mutation({
  args: {
    sandboxId: v.id("daytonaSandboxes"),
    branch: v.string(),
  },
  handler: async (ctx, args) => {
    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox) throw new Error("Sandbox not found");

    const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);

    await daytonaSandbox.toolbox.executeCommand({
      cmd: `cd workspace && git checkout ${args.branch}`,
    });

    await ctx.db.patch(args.sandboxId, {
      lastActivity: Date.now(),
      branch: args.branch,
    });

    return true;
  },
});

export const gitBranch = mutation({
  args: {
    sandboxId: v.id("daytonaSandboxes"),
    branchName: v.string(),
  },
  handler: async (ctx, args) => {
    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox) throw new Error("Sandbox not found");

    const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);

    await daytonaSandbox.toolbox.executeCommand({
      cmd: `cd workspace && git checkout -b ${args.branchName}`,
    });

    await ctx.db.patch(args.sandboxId, {
      lastActivity: Date.now(),
      branch: args.branchName,
    });

    return true;
  },
});

export const gitAdd = mutation({
  args: {
    sandboxId: v.id("daytonaSandboxes"),
    files: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox) throw new Error("Sandbox not found");

    const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);

    for (const file of args.files) {
      await daytonaSandbox.toolbox.executeCommand({
        cmd: `cd workspace && git add ${file}`,
      });
    }

    await ctx.db.patch(args.sandboxId, { lastActivity: Date.now() });
    return true;
  },
});

export const gitCommit = mutation({
  args: {
    sandboxId: v.id("daytonaSandboxes"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox) throw new Error("Sandbox not found");

    const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);

    await daytonaSandbox.toolbox.executeCommand({
      cmd: `cd workspace && git commit -m "${args.message.replace(/"/g, '\\"')}"`,
    });

    await ctx.db.patch(args.sandboxId, { lastActivity: Date.now() });
    return true;
  },
});

export const gitPush = mutation({
  args: {
    sandboxId: v.id("daytonaSandboxes"),
    remote: v.optional(v.string()),
    branch: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sandbox = await ctx.db.get(args.sandboxId);
    if (!sandbox) throw new Error("Sandbox not found");

    const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);

    const remote = args.remote ?? "origin";
    const branch = args.branch ?? sandbox.branch;

    await daytonaSandbox.toolbox.executeCommand({
      cmd: `cd workspace && git push ${remote} ${branch}`,
    });

    await ctx.db.patch(args.sandboxId, { lastActivity: Date.now() });
    return true;
  },
});
```

### 2.4 Idle Timeout Worker

**File:** `convex/daytona/timeout-worker.ts`

```typescript
import { query } from "../_generated/server";
import { daytona } from "./config";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const cleanupIdleSandboxes = query({
  handler: async (ctx) => {
    const sandboxes = await ctx.db
      .table("daytonaSandboxes")
      .filter((q) => q.eq(q.field("status"), "running"))
      .collect();

    const now = Date.now();
    const idleSandboxes = sandboxes.filter(
      (s) => now - (s.lastActivity ?? s.createdAt) > IDLE_TIMEOUT_MS,
    );

    for (const sandbox of idleSandboxes) {
      try {
        const daytonaSandbox = await daytona.sandbox(sandbox.daytonaSandboxId);
        await daytonaSandbox.delete();
        await ctx.db.patch(sandbox._id, { status: "destroyed" });
      } catch (error) {
        console.error(`Failed to destroy sandbox ${sandbox._id}:`, error);
      }
    }

    return { destroyedCount: idleSandboxes.length };
  },
});

// Run cleanup every minute
setInterval(async () => {
  await cleanupIdleSandboxes();
}, 60 * 1000);
```

## Phase 3: Frontend Tools

### 3.1 Convex API Client

**File:** `apps/web/lib/AITools/Daytona/client.ts`

```typescript
import { api } from "../../../convex/_generated/api";
import { convex } from "../../lib/convex";

export const daytonaClient = {
  async createSandbox(repoUrl: string, branch?: string) {
    return await convex.mutation(api.daytona.sandbox.createSandbox, {
      repoUrl,
      branch,
    });
  },

  async destroySandbox(sandboxId: string) {
    return await convex.mutation(api.daytona.sandbox.destroy, {
      sandboxId: sandboxId as any,
    });
  },

  async execute(sandboxId: string, command: string) {
    return await convex.mutation(api.daytona.sandbox.execute, {
      sandboxId: sandboxId as any,
      command,
    });
  },

  async readFile(sandboxId: string, path: string) {
    return await convex.mutation(api.daytona.sandbox.readFile, {
      sandboxId: sandboxId as any,
      path,
    });
  },

  async writeFile(sandboxId: string, path: string, content: string) {
    return await convex.mutation(api.daytona.sandbox.writeFile, {
      sandboxId: sandboxId as any,
      path,
      content,
    });
  },

  async gitClone(sandboxId: string, repoUrl: string, branch?: string) {
    return await convex.mutation(api.daytona.git.gitClone, {
      sandboxId: sandboxId as any,
      repoUrl,
      branch,
    });
  },

  async gitCheckout(sandboxId: string, branch: string) {
    return await convex.mutation(api.daytona.git.gitCheckout, {
      sandboxId: sandboxId as any,
      branch,
    });
  },

  async gitBranch(sandboxId: string, branchName: string) {
    return await convex.mutation(api.daytona.git.gitBranch, {
      sandboxId: sandboxId as any,
      branchName,
    });
  },

  async gitAdd(sandboxId: string, files: string[]) {
    return await convex.mutation(api.daytona.git.gitAdd, {
      sandboxId: sandboxId as any,
      files,
    });
  },

  async gitCommit(sandboxId: string, message: string) {
    return await convex.mutation(api.daytona.git.gitCommit, {
      sandboxId: sandboxId as any,
      message,
    });
  },

  async gitPush(sandboxId: string, remote?: string, branch?: string) {
    return await convex.mutation(api.daytona.git.gitPush, {
      sandboxId: sandboxId as any,
      remote,
      branch,
    });
  },

  async getStatus(sandboxId: string) {
    return await convex.query(api.daytona.sandbox.getStatus, {
      sandboxId: sandboxId as any,
    });
  },
};
```

### 3.2 Tool Definitions

**File:** `apps/web/lib/AITools/Daytona/tools/createSandbox.ts`

```typescript
import type { Tool } from "ai";
import { daytonaClient } from "../client";

export const daytonaCreateSandbox: Tool = {
  description:
    "Create a new Daytona sandbox and clone a GitHub repository. Use this first to set up a development environment.",
  parameters: {
    type: "object",
    properties: {
      repoUrl: {
        type: "string",
        description:
          "The GitHub repository URL (e.g., https://github.com/owner/repo or owner/repo)",
      },
      branch: {
        type: "string",
        description: "Optional branch to checkout after cloning",
      },
    },
    required: ["repoUrl"],
  },
  async execute({ repoUrl, branch }: { repoUrl: string; branch?: string }) {
    try {
      // Normalize repo URL
      const normalizedUrl = repoUrl.startsWith("https://github.com/")
        ? repoUrl
        : `https://github.com/${repoUrl}`;

      const sandboxId = await daytonaClient.createSandbox(
        normalizedUrl,
        branch,
      );

      return {
        success: true,
        sandboxId,
        message: `Sandbox created and repository cloned. Branch: ${branch ?? "main"}`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create sandbox",
      };
    }
  },
};
```

**File:** `apps/web/lib/AITools/Daytona/tools/runCommand.ts`

```typescript
import type { Tool } from "ai";
import { daytonaClient } from "../client";

export const daytonaRunCommand: Tool = {
  description:
    "Execute a command in the Daytona sandbox. Use for installing dependencies, running scripts, or any other command-line operations.",
  parameters: {
    type: "object",
    properties: {
      sandboxId: {
        type: "string",
        description: "The sandbox ID",
      },
      command: {
        type: "string",
        description: "The command to execute",
      },
    },
    required: ["sandboxId", "command"],
  },
  async execute({
    sandboxId,
    command,
  }: {
    sandboxId: string;
    command: string;
  }) {
    try {
      const output = await daytonaClient.execute(sandboxId, command);

      // Update last activity
      await daytonaClient.getStatus(sandboxId);

      return {
        success: true,
        output,
        sandboxId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Command failed",
        sandboxId,
      };
    }
  },
};
```

**File:** `apps/web/lib/AITools/Daytona/tools/gitClone.ts`

```typescript
import type { Tool } from "ai";
import { daytonaClient } from "../client";

export const daytonaGitClone: Tool = {
  description:
    "Clone or re-clone a GitHub repository in the sandbox. Use when switching to a different repository.",
  parameters: {
    type: "object",
    properties: {
      sandboxId: {
        type: "string",
        description: "The sandbox ID",
      },
      repoUrl: {
        type: "string",
        description: "The GitHub repository URL",
      },
      branch: {
        type: "string",
        description: "Optional branch to checkout",
      },
    },
    required: ["sandboxId", "repoUrl"],
  },
  async execute({
    sandboxId,
    repoUrl,
    branch,
  }: {
    sandboxId: string;
    repoUrl: string;
    branch?: string;
  }) {
    try {
      await daytonaClient.gitClone(sandboxId, repoUrl, branch);

      return {
        success: true,
        message: `Repository cloned: ${repoUrl}`,
        sandboxId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Clone failed",
        sandboxId,
      };
    }
  },
};
```

**File:** `apps/web/lib/AITools/Daytona/tools/gitCommit.ts`

```typescript
import type { Tool } from "ai";
import { daytonaClient } from "../client";

export const daytonaGitCommit: Tool = {
  description:
    "Commit staged changes in the sandbox with a descriptive message.",
  parameters: {
    type: "object",
    properties: {
      sandboxId: {
        type: "string",
        description: "The sandbox ID",
      },
      message: {
        type: "string",
        description: "The commit message",
      },
    },
    required: ["sandboxId", "message"],
  },
  async execute({
    sandboxId,
    message,
  }: {
    sandboxId: string;
    message: string;
  }) {
    try {
      await daytonaClient.gitCommit(sandboxId, message);

      return {
        success: true,
        message: `Changes committed: ${message}`,
        sandboxId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Commit failed",
        sandboxId,
      };
    }
  },
};
```

**File:** `apps/web/lib/AITools/Daytona/tools/gitPush.ts`

```typescript
import type { Tool } from "ai";
import { daytonaClient } from "../client";

export const daytonaGitPush: Tool = {
  description:
    "Push committed changes to the remote repository. Note: The user must manually create a pull request on GitHub.",
  parameters: {
    type: "object",
    properties: {
      sandboxId: {
        type: "string",
        description: "The sandbox ID",
      },
      remote: {
        type: "string",
        description: "The remote name (default: origin)",
      },
      branch: {
        type: "string",
        description: "The branch to push (default: current branch)",
      },
    },
    required: ["sandboxId"],
  },
  async execute({
    sandboxId,
    remote,
    branch,
  }: {
    sandboxId: string;
    remote?: string;
    branch?: string;
  }) {
    try {
      await daytonaClient.gitPush(sandboxId, remote, branch);

      return {
        success: true,
        message: "Changes pushed successfully. Create a PR on GitHub to merge.",
        sandboxId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Push failed",
        sandboxId,
      };
    }
  },
};
```

### 3.3 Index Export

**File:** `apps/web/lib/AITools/Daytona/index.ts`

```typescript
import { daytonaCreateSandbox } from "./tools/createSandbox";
import { daytonaDestroySandbox } from "./tools/destroySandbox";
import { daytonaRunCommand } from "./tools/runCommand";
import { daytonaReadFile } from "./tools/readFile";
import { daytonaWriteFile } from "./tools/writeFile";
import { daytonaGitClone } from "./tools/gitClone";
import { daytonaGitCheckout } from "./tools/gitCheckout";
import { daytonaGitBranch } from "./tools/gitBranch";
import { daytonaGitAdd } from "./tools/gitAdd";
import { daytonaGitCommit } from "./tools/gitCommit";
import { daytonaGitPush } from "./tools/gitPush";

export const DaytonaTools = {
  daytonaCreateSandbox,
  daytonaDestroySandbox,
  daytonaRunCommand,
  daytonaReadFile,
  daytonaWriteFile,
  daytonaGitClone,
  daytonaGitCheckout,
  daytonaGitBranch,
  daytonaGitAdd,
  daytonaGitCommit,
  daytonaGitPush,
};

export const DaytonaToolsKeys = Object.keys(DaytonaTools) as [
  keyof typeof DaytonaTools,
][number];
```

## Phase 4: Mode Configuration

### 4.1 Update Mode Mapping

**File:** `apps/web/lib/AITools/ModeMapping.ts`

```typescript
import { DaytonaToolsKeys } from "./Daytona";

// ... existing imports

export const ModeMapping: Record<string, Mode> = {
  // ... existing modes
  DevAgent: {
    name: "DevAgent",
    activeTools: [...DaytonaToolsKeys, ...taskflowToolsKeys] as ToolKey[],
  },
};
```

### 4.2 Add DevAgent Mode Prompt

**File:** `apps/web/lib/AITools/ModePrompts.ts`

```typescript
export const ModePrompts: Record<string, string> = {
  // ... existing prompts

  DevAgent: `You are a DevAgent with the ability to make code changes to GitHub repositories using Daytona sandboxes.

**Your Primary Goal:** Help users write, modify, and push code changes to GitHub repositories.

**Available Tools:**
- Daytona sandbox tools (create sandbox, execute commands, file operations)
- Git operations (clone, branch, commit, push)
- Taskflow workspace tools (tasks, projects, inbox)
- Web search and scraping tools

**Workflow:**
1. Create a sandbox and clone the user's repository
2. Create a new branch for your changes
3. Install dependencies as needed using the command tool
4. Read, write, and modify files as requested
5. Commit changes with clear, descriptive messages
6. Push changes to the remote repository
7. Inform the user that changes have been pushed and they should create a PR on GitHub

**Behavior Guidelines:**
1. **Always create a branch** for your changes - never commit directly to main
2. **Install dependencies** in the sandbox as needed for the task
3. **Commit frequently** with clear messages explaining what changed
4. **Push before completing** the conversation so changes aren't lost
5. **Confirm before destructive operations** like overwriting files
6. **Report progress** at each step so the user knows what's happening

**Critical Rules:**
- Always create a new branch for changes (don't work on main/master)
- Use descriptive branch names and commit messages
- Install dependencies with npm/yarn/pip as needed in the sandbox
- Push commits before the conversation ends
- Let the user know they need to create a PR on GitHub after you push

**Response Style:**
- Brief, focused on the task
- Confirm each major step (branch created, dependencies installed, changes committed, pushed)
- End with instructions for creating a PR on GitHub`,
};
```

## Phase 5: UI Integration

### 5.1 Add DevAgent to Mode Selector

**File:** `apps/web/components/ai-elements/mode-selector.tsx`

```typescript
"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AVAILABLE_MODES } from "@/lib/AITools/ModePrompts"
import { Code2 } from "lucide-react"

export function ModeSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (mode: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Select mode" />
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_MODES.map((mode) => (
          <SelectItem key={mode} value={mode}>
            <div className="flex items-center gap-2">
              {mode === "DevAgent" && <Code2 className="w-4 h-4" />}
              <span>{mode}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### 5.2 Sandbox Status Badge

**File:** `apps/web/components/ai-elements/sandbox-status.tsx`

```typescript
"use client"

import { Badge } from "@/components/ui/badge"
import { Loader2, Terminal } from "lucide-react"

interface SandboxStatusProps {
  status: "stopped" | "starting" | "running" | "idle"
  branch?: string
}

export function SandboxStatus({ status, branch }: SandboxStatusProps) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    stopped: "secondary",
    starting: "outline",
    running: "default",
    idle: "secondary",
  }

  const icons = {
    stopped: null,
    starting: <Loader2 className="w-3 h-3 animate-spin" />,
    running: <Terminal className="w-3 h-3" />,
    idle: <Terminal className="w-3 h-3" />,
  }

  return (
    <Badge variant={variants[status] ?? "secondary"} className="flex items-center gap-1">
      {icons[status]}
      <span className="capitalize">{status}</span>
      {branch && <span className="text-muted-foreground">• {branch}</span>}
    </Badge>
  )
}
```

### 5.3 Git Push Confirmation Modal

**File:** `apps/web/components/ai-elements/git-push-confirmation.tsx`

```typescript
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface GitPushConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  branch: string
}

export function GitPushConfirmation({
  open,
  onOpenChange,
  onConfirm,
  branch,
}: GitPushConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Push Changes to GitHub</DialogTitle>
          <DialogDescription>
            You're about to push commits from branch "{branch}" to GitHub.
            After pushing, you'll need to create a pull request manually on GitHub.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Push to GitHub
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Environment Variables

### Backend

**File:** `apps/backend/.env`

```bash
# Daytona
DAYTONA_API_KEY=your-daytona-api-key
DAYTONA_API_URL=https://app.daytona.io/api

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Frontend

**File:** `apps/web/.env`

```bash
NEXT_PUBLIC_CONVEX_URL=your-convex-url
```

## Database Schema

**File:** `convex/schema.ts`

```typescript
schema.defineTable({
  // ... existing tables
  daytonaSandboxes: schema.defineTable({
    userId: schema.string(),
    daytonaSandboxId: schema.string(),
    repoUrl: schema.string(),
    branch: schema.string(),
    createdAt: schema.number(),
    lastActivity: schema.number(),
    status: schema.enum(["running", "stopped", "destroyed"]),
  }),
});
```

## Execution Order

1. **GitHub OAuth Integration**
   - Add GitHub provider to Convex auth
   - Implement token storage mutations
   - Create repo picker API endpoint

2. **Daytona Backend**
   - Install `@daytonaio/sdk` in backend
   - Create `convex/daytona/` module
   - Implement sandbox lifecycle, git operations, file system
   - Add idle timeout worker
   - Update schema

3. **Frontend Tools**
   - Create `lib/AITools/Daytona/` directory
   - Implement Convex API client
   - Define all tool functions
   - Export from index

4. **Mode Configuration**
   - Add "DevAgent" to ModeMapping
   - Add DevAgent prompt to ModePrompts
   - Update AVAILABLE_MODES type

5. **UI Integration**
   - Add DevAgent to mode selector
   - Create GitHub repo selector
   - Add sandbox status badge
   - Add git push confirmation modal
   - Integrate terminal output component

6. **Testing**
   - Test sandbox creation and destruction
   - Test git clone, branch, commit, push
   - Test file operations
   - Test idle timeout cleanup

## Notes

- **PR Creation**: Left to the user—agent only pushes commits
- **Dependency Installation**: Agent handles via `daytonaRunCommand` (npm install, pip install, etc.)
- **Idle Timeout**: 5 minutes inactivity triggers auto-destroy
- **Pricing**: Daytona charges by uptime—sandbox persists per session
