"use client";

type MessageLike = {
  messageId?: string;
  content: unknown;
};

type ExtractedChatSource = {
  url: string;
  title?: string;
  domain: string;
  toolKey: string;
  messageId: string;
};

type SourceCandidate = {
  url: string;
  title?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function toSourceCandidate(value: unknown): SourceCandidate | null {
  if (!isRecord(value)) return null;
  const url = getString(value.url);
  if (!url) return null;

  return {
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

function extractToolSources(
  toolKey: string,
  output: unknown,
): SourceCandidate[] {
  if (!isRecord(output)) return [];

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
      return isRecord(output.data) ? collectArraySources([output.data]) : [];
    case "advancedResearch": {
      return [
        ...collectArraySources(output.sources),
        ...collectArraySources(output.scrapedSources),
      ];
    }
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
      if (!isRecord(part)) continue;

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
        if (!deduped.has(source.url)) {
          deduped.set(source.url, {
            url: source.url,
            title: source.title,
            domain: getDomain(source.url),
            toolKey,
            messageId,
          });
        }
      }
    }
  }

  return Array.from(deduped.values());
}

export type { ExtractedChatSource };
