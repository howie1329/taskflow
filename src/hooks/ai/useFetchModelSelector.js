import axiosClient from "@/lib/axios/axiosClient";
import { useQuery } from "@tanstack/react-query";

const fetchModelSelector = async () => {
  const response = await axiosClient.get("/api/ai/models");
  const filteredModels = response.data.data.filter((model) =>
    modelNames.includes(model.id)
  );
  return filteredModels;
};

const useFetchModelSelector = () => {
  return useQuery({
    queryKey: ["modelSelector"],
    queryFn: () => fetchModelSelector(),
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
  "openai/gpt-4.1-mini",
  "openai/gpt-4o-mini",
  "google/gemini-2.5-flash",
  "anthropic/claude-3-haiku",
  "x-ai/grok-3-mini",
  "x-ai/grok-code-fast-1",
];
