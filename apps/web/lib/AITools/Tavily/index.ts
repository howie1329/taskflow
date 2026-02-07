import { TavilyWebSearch } from "./webSearch";

// Export types for Tavly web search
export {
  type TavilyResult,
  type TavilyWebSearchOutput,
  isTavilyWebSearchOutput,
  hasTavilyEnhancedData,
  normalizeTavilyOutput,
} from "./types";

// used to export the full tools
export const TavilyTools = {
  tavilyWebSearch: TavilyWebSearch,
};

// used to export the keys of the tools
export const TavilyToolsKeys = Object.keys(TavilyTools);
