# Artifact System Documentation

## Overview

The Artifact System provides a standardized way to track and communicate AI tool execution states and results between the backend and frontend.

## Architecture

### Components

1. **ArtifactHelpers.js** - Core utilities for artifact management
2. **VercelAITools.js** - All tools now use ArtifactWriter
3. **Frontend** - Collects and displays artifacts

## Artifact States

Each artifact goes through these states:

- `pending` - Initialized, about to start
- `loading` - Actively executing
- `complete` - Successfully finished with results
- `error` - Failed with error message

## Artifact Data Structure

```javascript
{
  status: "pending" | "loading" | "complete" | "error",
  toolName: string,          // e.g., "GetTasks", "WebSearch"
  message: string,            // Human-readable status
  input: object,              // Tool parameters
  outputs: object | null,     // Results (null until complete)
  error: string | null,       // Error message (null unless error)
  timestamp: string,          // ISO 8601 format
  duration?: number          // Milliseconds (only when complete/error)
}
```

## Usage

### Basic Pattern

```javascript
import { ArtifactWriter } from "./ArtifactHelpers.js";

SomeTool: new tool({
  execute: async ({ param1, param2 }) => {
    const artifact = new ArtifactWriter(writer, "SomeTool");
    const input = { param1, param2 };

    try {
      artifact.loading(input, "Doing something...");
      
      const result = await doSomething();
      
      artifact.complete(input, { result }, "Success message");
      
      return result;
    } catch (error) {
      artifact.error(input, error, "Failed to do something");
      throw error;
    }
  },
}),
```

### Advanced Pattern (withArtifact)

```javascript
import { withArtifact } from "./ArtifactHelpers.js";

SomeTool: new tool({
  execute: async ({ param }) => {
    return withArtifact(writer, "SomeTool", { param }, async (artifact) => {
      artifact.loading({ param }, "Doing something...");
      const result = await doSomething();
      artifact.complete({ param }, { result }, "Success");
      return result;
    });
  },
}),
```

## Updated Tools

All tools now use the ArtifactWriter:

### Task Tools
- ✅ GetTasks
- ✅ GetTaskById
- ✅ CreateTask
- ✅ UpdateTask
- ✅ DeleteTask

### Subtask Tools
- ✅ GetSubtasks
- ✅ CreateSubtask
- ✅ UpdateSubtask
- ✅ DeleteSubtask
- ✅ BulkCreateSubtasks
- ✅ MarkSubtaskComplete

### Note Tools
- ✅ GetNotes
- ✅ GetNotesByTaskId
- ✅ CreateNote
- ✅ UpdateNote
- ✅ DeleteNote

### Search Tools
- ✅ WebSearch

## Frontend Integration

### Collecting Artifacts

```javascript
// In ChatMessageProvider.js
export const toolArtifactsCollector = (messages) => {
  const tempToolArtifacts = [];
  messages.forEach((message) => {
    message.parts.forEach((part) => {
      if (part.type?.startsWith("data-artifact-")) {
        tempToolArtifacts.push(part.data);
      }
    });
  });
  return tempToolArtifacts;
};
```

### Displaying Artifacts

```javascript
const ArtifactCard = ({ artifact }) => {
  const { status, toolName, message, outputs, error, duration } = artifact;
  
  return (
    <div className="artifact-card">
      {status === "loading" && <Spinner />}
      {status === "complete" && <CheckIcon />}
      {status === "error" && <ErrorIcon />}
      
      <h3>{toolName}</h3>
      <p>{message}</p>
      
      {outputs && <Results data={outputs} />}
      {error && <ErrorMessage error={error} />}
      {duration && <span>{duration}ms</span>}
    </div>
  );
};
```

## Benefits

1. **Consistency** - All tools have identical structure
2. **Real-time Updates** - Frontend sees loading → complete states
3. **Error Handling** - Failures are gracefully captured
4. **Performance Tracking** - Duration metrics for optimization
5. **Rich Data** - Structured outputs for UI components
6. **Less Boilerplate** - ArtifactWriter handles complexity
7. **Type Safety** - Easy to add TypeScript types

## Example Output Structures

### GetTasks
```javascript
{
  tasksCount: 27,
  tasks: [{id, title, description, date, priority, ...}],
  summary: {
    completed: 5,
    byPriority: { high: 10, medium: 12, low: 5 }
  }
}
```

### WebSearch
```javascript
{
  resultsCount: 2,
  sources: [{
    url, title, summary, text, 
    highlights: [{text, score}],
    publishedDate, author
  }],
  cost: { total, search, contents }
}
```

### CreateTask
```javascript
{
  task: {
    id, title, description, date, 
    priority, labels, isCompleted, 
    status, projectId, createdAt
  }
}
```

## Testing

To test artifacts:

1. Start the backend server
2. Open the frontend chat interface
3. Ask the AI to perform operations:
   - "Show me all my tasks"
   - "Create a task called 'Test'"
   - "Search the web for Apple profits"
4. Open browser DevTools console
5. Check artifacts in the artifacts panel (toggle button in header)

## Migration Notes

### What Changed

- ❌ Removed: `data-{toolname}` status updates (redundant with `tool-*` parts)
- ✅ Added: `data-artifact-{toolname}` with full state tracking
- ✅ All tools now have consistent error handling
- ✅ All artifacts include duration metrics
- ✅ Unique IDs per artifact instance (no more overwrites)

### Breaking Changes

None - This is additive. Old artifacts are replaced with new format.

## Future Enhancements

- [ ] TypeScript types for artifact data
- [ ] Artifact versioning
- [ ] Artifact caching on frontend
- [ ] Artifact analytics dashboard
- [ ] Retry failed operations from artifacts
- [ ] Export artifacts as JSON

