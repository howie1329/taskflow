import { GoogleGenerativeAI } from "@google/generative-ai";
import { sub } from "date-fns";

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
    subtasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          subtask_name: {
            type: "string",
            description: "The name of the subtask",
          },
        },
        required: ["subtask_name"],
      },
    },
    note: {
      type: "string",
      description: "Notes for the task",
    },
  },
  required: ["title", "description", "subtasks", "note"],
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});

export default model;
