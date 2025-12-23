export const createDecidingModelPrompt = (userContext, userQuestion) => {
  return `Route user questions to the correct tool group.

CONTEXT:
Tasks: ${userContext.tasks || "None"}
Messages: ${userContext.messages || "None"}  
Notes: ${userContext.notes || "None"}
Question: ${userQuestion}

TOOL GROUPS:
"Fetch" → Get data (show/list/find)
"Write" → Modify data (create/update/delete)
"Fetch and Write" → Get then modify
"No tools" → Answerable from context or general advice

CONFIDENCE:
90-100 = Clear intent, 70-89 = Minor ambiguity, 50-69 = Moderate uncertainty, <50 = Very unclear

RELATED CONTEXT:
Extract specific items from context relevant to question. Use [] if unrelated.

RESPOND:
{
  "model": "gpt-5",
  "toolGroup": "[exact string from above]",
  "confidenceLevel": [0-100],
  "reasoning": "[1-2 sentences why]",
  "relatedContext": ["item 1", "item 2"] or []
}`;
};
