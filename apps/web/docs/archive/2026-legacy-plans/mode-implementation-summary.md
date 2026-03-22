# Mode-Based Prompts Implementation Summary

## Files Created

### 1. `/apps/web/lib/AITools/ModePrompts.ts`

- Contains mode-specific system prompts for all 5 modes (Basic, Advanced, Finance, Research, Social)
- Each prompt includes:
  - Available tools for that mode
  - Behavior guidelines
  - Tool failure handling & backup strategies
  - Response style guidelines
- Exports:
  - `ModePrompts` - Record of all prompts
  - `getModePrompt(modeName)` - Helper to get prompt for a mode
  - `getModeWithPrompt(modeName)` - Helper to get mode with prompt
  - `listModes()` - Helper to list all modes
  - `AVAILABLE_MODES` - Array of mode names
  - `ModeName` - Type for mode names
  - `getModeDescription(modeName)` - Get description for a mode

### 2. `/apps/web/components/ai-elements/mode-selector.tsx`

- Mode selector UI component following the same pattern as model-selector
- Exports all necessary sub-components:
  - ModeSelector, ModeSelectorTrigger, ModeSelectorContent
  - ModeSelectorInput, ModeSelectorList, ModeSelectorEmpty
  - ModeSelectorGroup, ModeSelectorItem
  - ModeSelectorShortcut, ModeSelectorSeparator
  - ModeSelectorName, ModeSelectorDescription

## Files Modified

### 1. `/apps/web/app/app/chat/components/chat-provider.tsx`

- Added `selectedMode` state (defaults to "Basic")
- Added `setSelectedMode` function
- Included `mode: selectedMode` in sendMessage body
- Added type import for `ModeName`

### 2. `/apps/web/lib/ai_context.ts`

- Added import for `getModePrompt` and `ModeName`
- Modified `buildSystemPrompt()` to accept optional `modeName` parameter
- Injects mode-specific prompt between base instructions and project context
- Function signature: `buildSystemPrompt(projectContext?, modeName?, customInstructions?)`

### 3. `/apps/web/app/api/chat/route.ts`

- Added import for `ModeName` type
- Modified buildSystemPrompt call to pass mode: `buildSystemPrompt(projectContext ?? undefined, mode as ModeName)`
- Added type assertion for activeTools to fix pre-existing type error

### 4. `/apps/web/app/app/chat/page.tsx`

- Added imports for ModeSelector components
- Added imports for `AVAILABLE_MODES` and `getModeDescription`
- Extracted `selectedMode` and `setSelectedMode` from context
- Added ModeSelector dropdown between ModelSelector and ProjectSelector
- Shows mode name in trigger and name+description in dropdown items

### 5. `/apps/web/app/app/chat/[threadId]/page.tsx`

- Added imports for ModeSelector components
- Added imports for `AVAILABLE_MODES` and `getModeDescription`
- Extracted `selectedMode` and `setSelectedMode` from context
- Added ModeSelector dropdown between ModelSelector and ProjectSelector

## How It Works

1. **User selects a mode** from the dropdown in the chat input footer
2. **Mode is stored in context** (`selectedMode` state in ChatProvider)
3. **When sending a message**, mode is included in the request body
4. **Backend receives the mode** and:
   - Looks up active tools from `ModeMapping`
   - Gets mode-specific prompt from `ModePrompts`
   - Builds system prompt with base instructions + mode prompt + project context
5. **AI receives mode-specific instructions** that guide:
   - Which tools to prioritize
   - How to handle tool failures
   - Response style and format

## Mode Prompts Features

Each mode prompt includes:

### Tool Failure Handling

- **Exa fails** → Use Firecrawl or Parallel
- **Firecrawl fails** → Try alternative URLs or ask user for content
- **Parallel fails** → Use Exa or Valyu
- **Valyu fails** → Use Parallel or Firecrawl
- **Taskflow tools fail** → Inform user, don't claim success

### Mode-Specific Behaviors

- **Basic**: Productivity-focused, concise responses, proactive task creation
- **Advanced**: Multi-source research, deep extraction, comprehensive answers
- **Finance**: Data accuracy, trend analysis, investment disclaimers
- **Research**: Source quality, synthesis over summary, methodical approach
- **Social**: Trend monitoring, sentiment analysis, competitive awareness

## Key Features

1. **Fallback strategies** documented for each tool in each mode
2. **Tool selection guidance** helps AI choose the right tool
3. **Failure acknowledgment** - AI must inform users of tool failures
4. **No silent failures** - Always report errors to users
5. **Consistent structure** across all mode prompts

## Testing

To test the implementation:

1. Open the chat interface
2. Select different modes from the dropdown
3. Ask questions relevant to each mode
4. Observe how the AI behavior changes based on the selected mode
5. Test tool failure scenarios (can be simulated by disabling APIs)
