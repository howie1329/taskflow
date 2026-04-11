"use client"

import { isPlainObject } from "@/lib/utils/guards"
import { getDomain } from "@/lib/utils/url"

type MessageLike = {
  messageId?: string
  content: unknown
}

type ExtractedChatSource = {
  kind: "url" | "file"
  url?: string
  path?: string
  startLine?: number
  endLine?: number
  title?: string
  domain?: string
  toolKey: string
  messageId: string
}

type SourceCandidate = {
  kind: "url" | "file"
  url?: string
  path?: string
  startLine?: number
  endLine?: number
  title?: string
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined
}

function toSourceCandidate(value: unknown): SourceCandidate | null {
  if (!isPlainObject(value)) return null;
  const url = getString(value.url);
  if (!url) return null;

  return {
    kind: "url",
    url,
    title: getString(value.title),
  };
}

function collectArraySources(value: unknown): SourceCandidate[] {
  if (!Array.isArray(value)) return [];

  const results: SourceCandidate[] = [];
  for (const item of value) {
    const candidate = toSourceCandidate(item);
    if (candidate) {
      results.push(candidate);
    }
  }

  return results;
}

function collectDaytonaCitations(value: unknown): SourceCandidate[] {
  if (!Array.isArray(value)) return [];

  const results: SourceCandidate[] = [];
  for (const item of value) {
    if (!isPlainObject(item)) continue;
    const path = getString(item.path);
    if (!path) continue;

    results.push({
      kind: "file",
      path,
      startLine:
        typeof item.startLine === "number" ? Math.floor(item.startLine) : undefined,
      endLine:
        typeof item.endLine === "number" ? Math.floor(item.endLine) : undefined,
      title: getString(item.label) ?? path,
    });
  }

  return results;
}

function extractToolSources(
  toolKey: string,
  output: unknown,
): SourceCandidate[] {
  if (!isPlainObject(output)) return [];

  switch (toolKey) {
    case "tavilyWebSearch":
    case "exaWebSearch":
    case "parallelWebSearch":
    case "valyuWebSearch":
    case "valyuFinanceSearch":
      return collectArraySources(output.results);
    case "exaAnswer":
      return collectArraySources(output.citations);
    case "firecrawlSearch":
      return collectArraySources(output.data);
    case "firecrawlScrape":
      return isPlainObject(output.data) ? collectArraySources([output.data]) : [];
    case "advancedResearch": {
      return [
        ...collectArraySources(output.sources),
        ...collectArraySources(output.scrapedSources),
      ];
    }
    case "researchDaytonaRepo":
      return collectDaytonaCitations(output.citations);
    default:
      return [];
  }
}

export function extractSourcesFromMessages(
  messages: MessageLike[],
): ExtractedChatSource[] {
  const deduped = new Map<string, ExtractedChatSource>();

  for (const message of messages) {
    if (!Array.isArray(message.content)) continue;

    for (const part of message.content) {
      if (!isPlainObject(part)) continue;

      const type = getString(part.type);
      if (!type || (!type.startsWith("tool-") && type !== "dynamic-tool")) {
        continue;
      }

      const toolKey =
        type === "dynamic-tool"
          ? getString(part.toolName) ?? "dynamic-tool"
          : type.replace(/^tool-/, "");
      const sources = extractToolSources(toolKey, part.output);
      const messageId = message.messageId ?? "unknown-message";

      for (const source of sources) {
        const key =
          source.kind === "url"
            ? source.url
            : `${source.path}:${source.startLine ?? ""}:${source.endLine ?? ""}`

        if (!key || deduped.has(key)) {
          continue
        }

        deduped.set(key, {
          kind: source.kind,
          url: source.url,
          path: source.path,
          startLine: source.startLine,
          endLine: source.endLine,
          title: source.title,
          domain: source.url ? getDomain(source.url) : undefined,
          toolKey,
          messageId,
        });
      }
    }
  }

  return Array.from(deduped.values());
}

export function formatExtractedSourceLabel(source: ExtractedChatSource) {
  if (source.kind === "url" && source.url) {
    return source.url
  }

  if (!source.path) {
    return ""
  }

  if (typeof source.startLine === "number" && typeof source.endLine === "number") {
    return source.startLine === source.endLine
      ? `${source.path}:${source.startLine}`
      : `${source.path}:${source.startLine}-${source.endLine}`
  }

  if (typeof source.startLine === "number") {
    return `${source.path}:${source.startLine}`
  }

  return source.path
}

export type { ExtractedChatSource };
