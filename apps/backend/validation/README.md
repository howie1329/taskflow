# Validation System

This directory contains Zod validation schemas for all API endpoints in the backend.

## Overview

The validation system uses [Zod](https://zod.dev/) to validate request bodies, parameters, and query strings before they reach the controllers. This ensures data integrity and provides clear error messages to API consumers.

## Structure

- `schemas.js` - Contains all Zod validation schemas organized by entity type
- `../middleware/validation.js` - Express middleware factory for applying validation

## Usage

### In Routes

Validation is applied using the `validate` middleware:

```javascript
import { validate } from "../../middleware/validation.js";
import { createTaskSchema } from "../../validation/schemas.js";

router.post("/create", validate(createTaskSchema), createTask);
```

### Schema Structure

Schemas follow a consistent structure:

```javascript
export const createTaskSchema = z.object({
  body: z.object({
    // Request body fields
  }),
  params: z.object({
    // URL parameters (optional)
  }),
  query: z.object({
    // Query string parameters (optional)
  }),
});
```

### Validation Errors

When validation fails, the API returns a 400 status with a structured error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.title",
      "message": "Title is required"
    }
  ]
}
```

## Available Schemas

### Tasks
- `createTaskSchema` - Validates task creation
- `updateTaskSchema` - Validates task updates
- `taskParamsSchema` - Validates task ID parameter

### Notes
- `createNoteSchema` - Validates note creation
- `updateNoteSchema` - Validates note updates
- `noteParamsSchema` - Validates note ID parameter

### Projects
- `createProjectSchema` - Validates project creation
- `updateProjectSchema` - Validates project updates
- `projectParamsSchema` - Validates project ID parameter

### Subtasks
- `createSubtaskSchema` - Validates subtask creation
- `updateSubtaskSchema` - Validates subtask updates
- `subtaskParamsSchema` - Validates subtask ID parameter

### Notifications
- `createNotificationSchema` - Validates notification creation
- `notificationParamsSchema` - Validates notification ID parameter

### Conversations
- `createConversationSchema` - Validates conversation creation
- `conversationParamsSchema` - Validates conversation ID parameter
- `conversationIdParamsSchema` - Validates conversation ID (using `id` param)
- `sendMessageSchema` - Validates message sending

### Search
- `searchSchema` - Validates search queries

## Adding New Schemas

1. Define the schema in `schemas.js`:

```javascript
export const createNewEntitySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    // ... other fields
  }),
});
```

2. Apply it to your route:

```javascript
import { validate } from "../../middleware/validation.js";
import { createNewEntitySchema } from "../../validation/schemas.js";

router.post("/create", validate(createNewEntitySchema), createController);
```

## Common Patterns

### UUID Validation
```javascript
const uuidSchema = z.string().uuid("Invalid UUID format");
```

### Optional Fields
```javascript
description: z.string().optional()
```

### Nullable Fields
```javascript
date: z.string().date().optional().or(z.null())
```

### Enums
```javascript
const prioritySchema = z.enum(["None", "Low", "Medium", "High"]);
```

### Arrays
```javascript
labels: z.array(z.string()).optional()
```

### Refinements (Custom Validation)
```javascript
body: z.object({
  // fields
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
})
```

## Benefits

1. **Type Safety**: Zod schemas provide runtime type checking
2. **Clear Error Messages**: Validation errors are descriptive and actionable
3. **Security**: Prevents invalid data from reaching controllers
4. **Consistency**: Ensures all endpoints validate data consistently
5. **Documentation**: Schemas serve as documentation for API contracts
