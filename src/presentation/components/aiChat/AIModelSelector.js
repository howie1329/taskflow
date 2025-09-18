import useFetchModelSelector from "@/hooks/ai/useFetchModelSelector";
import React, { useState } from "react";

export const AIModelSelector = () => {
  const { data: modelSelector } = useFetchModelSelector();
  const [selectedModel, setSelectedModel] = useState();
  return <div>AIModelSelector</div>;
};
