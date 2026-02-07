// TypeScript interfaces for Tavly web search results
// These types extend the existing web search structure with Tavly-specific fields

/**
 * Individual search result item from Tavly
 * Contains rich metadata including relevance score, favicon, and publication date
 */
export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score?: number; // Relevance score (0-1)
  rawContent?: string | null; // Cleaned HTML content from the page
  publishedDate?: string | null; // Publication date for news articles
  favicon?: string | null; // Favicon URL for visual identification
}

/**
 * Complete Tavly web search output
 * Contains the search query, answer, results, and metadata
 */
export interface TavilyWebSearchOutput {
  query: string;
  answer: string | null; // LLM-generated answer based on search results
  images?: string[]; // Query-related images
  results: TavilyResult[];
  responseTime: number; // Response time in seconds
  requestId: string; // Unique request identifier
}

/**
 * Type guard to check if output is Tavly web search output
 * Uses duck typing to validate the structure
 * Supports both snake_case (API response) and camelCase (schema) formats
 */
export function isTavilyWebSearchOutput(
  output: unknown,
): output is TavilyWebSearchOutput {
  if (!output || typeof output !== "object") return false;

  const obj = output as Record<string, unknown>;

  // Check required fields - support both camelCase and snake_case
  const hasQuery = "query" in obj && typeof obj.query === "string";
  const hasResults = "results" in obj && Array.isArray(obj.results);

  // Check for responseTime (camelCase) OR response_time (snake_case from API)
  const hasResponseTime =
    ("responseTime" in obj && typeof obj.responseTime === "number") ||
    ("response_time" in obj && typeof obj.response_time === "number");

  // Check for requestId (camelCase) OR request_id (snake_case from API)
  const hasRequestId =
    ("requestId" in obj && typeof obj.requestId === "string") ||
    ("request_id" in obj && typeof obj.request_id === "string");

  return hasQuery && hasResults && hasResponseTime && hasRequestId;
}

/**
 * Normalize Tavly output to ensure camelCase properties
 * The Tavly API returns snake_case, but our components expect camelCase
 */
export function normalizeTavilyOutput(
  output: Record<string, unknown>,
): TavilyWebSearchOutput {
  return {
    query: output.query as string,
    answer: (output.answer as string | null) ?? null,
    images: (output.images as string[] | undefined) ?? [],
    results: (output.results as TavilyResult[]) ?? [],
    responseTime:
      (output.responseTime as number | undefined) ??
      (output.response_time as number | undefined) ??
      0,
    requestId:
      (output.requestId as string | undefined) ??
      (output.request_id as string | undefined) ??
      "",
  };
}

/**
 * Check if a result has Tavly-specific enhanced data
 * Useful for determining if we should render the enhanced card
 */
export function hasTavilyEnhancedData(
  result: TavilyResult,
): result is TavilyResult & { score: number } {
  return (
    result.score !== undefined &&
    typeof result.score === "number" &&
    result.score >= 0 &&
    result.score <= 1
  );
}
