# Task Board Architecture

This directory contains the modular board system for the task page. The architecture allows for easy swapping of board types and adding new board implementations.

## Architecture Overview

### Components

1. **BoardInterface.js** - Defines the contract/interface for board components
2. **KanbanBoard.js** - Kanban-style board implementation
3. **BoardRegistry.js** - Registry/factory for managing different board types

### How It Works

1. **Board Interface**: All boards must accept:
   - `data` - Array of task objects
   - `onTaskUpdate` - Callback when tasks are updated
   - `config` - Optional configuration object

2. **Board Registry**: Central registry that maps board type names to components
   - Use `getBoardComponent(boardType)` to get a board component
   - Use `getAvailableBoardTypes()` to see all available types

3. **Usage**: Boards are used through `TaskPageClient` which selects the board based on `boardType` prop

## Adding a New Board Type

To add a new board type (e.g., ListBoard):

1. Create `ListBoard.js` in this directory:
```javascript
"use client";
export const ListBoard = ({ data = [], onTaskUpdate, config = {} }) => {
  // Your board implementation
  return <div>List Board</div>;
};
```

2. Register it in `BoardRegistry.js`:
```javascript
import { ListBoard } from "./ListBoard";

const BOARD_TYPES = {
  kanban: KanbanBoard,
  list: ListBoard,  // Add here
};
```

3. Use it in `TaskPageClient` or page:
```javascript
<TaskPageClient boardType="list" />
```

## Current Board Types

- **kanban** - Kanban-style board with drag-and-drop columns

## Future Board Types (Examples)

- **list** - Simple list view
- **timeline** - Timeline/Gantt chart view
- **calendar** - Calendar-based view
- **table** - Table/spreadsheet view
