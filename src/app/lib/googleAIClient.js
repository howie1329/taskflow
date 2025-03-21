import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const schema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "The title of the task",
    },
    description: {
      type: "string",
      description: "Detailed information about the task",
    },
    subTasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          subTask_name: {
            type: "string",
            description: "The name of the subtask",
          },
        },
        required: ["subTask_name"],
      },
    },
  },
  required: ["title", "description", "subTasks"],
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});

export default model;
