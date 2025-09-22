import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";

const fetchModelSelector = async () => {
  const response = await axiosClient.get("/api/ai/models");
  const filteredModels = response.data.data.filter((model) =>
    modelNames.includes(model.id)
  );

  console.log(filteredModels);
  return filteredModels;
};

const useFetchModelSelector = () => {
  return useQuery({
    queryKey: ["modelSelector"],
    queryFn: () => fetchModelSelector(),
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export default useFetchModelSelector;

const modelNames = [
  "openrouter/sonoma-dusk-alpha",
  "openrouter/sonoma-sky-alpha",
  "deepseek/deepseek-chat-v3.1:free",
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.0-flash-001",
  "openai/gpt-4.1-nano",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-4.1-mini",
  "openai/gpt-4o-mini",
  "google/gemini-2.5-flash",
  "anthropic/claude-3-haiku",
  "x-ai/grok-3-mini",
  "x-ai/grok-code-fast-1",
  "x-ai/grok-4-fast:free",
  "google/gemini-flash-1.5",
  "google/gemini-2.5-pro",
  "",
];
