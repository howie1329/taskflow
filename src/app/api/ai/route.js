import model from "@/app/lib/googleAIClient";

export async function GET(req, res) {
  const prompt =
    "Create subtasks for the task of creating a simple todo react native and add any notes you think might be helpful.";
  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  res.json({ result });
}
