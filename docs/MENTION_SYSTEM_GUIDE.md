# How Mention Systems Are Built: A Comprehensive Guide

## Overview

Mention systems allow users to reference other entities (users, tasks, projects, etc.) in text input fields. They're found in:
- **Chat apps**: Slack, Discord, Teams (@user)
- **Project management**: Linear, Jira (@user, @task)
- **Code platforms**: GitHub (@user, @issue)
- **Note-taking**: Notion (@page, @user, @date)
- **Social media**: Twitter/X (@username)

---

## 🏗️ Architecture Overview

A mention system typically consists of:

1. **Detection Layer**: Detects when user types `@`
2. **Autocomplete UI**: Shows dropdown/popover with suggestions
3. **Search/Lookup**: Finds matching entities
4. **Parsing**: Extracts mentions from text
5. **Storage**: Stores mention data (structured or plain text)
6. **Rendering**: Displays mentions as rich components
7. **Notifications**: Alerts mentioned entities

```
┌─────────────────────────────────────────┐
│         User Types "@"                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Detection: "@" character detected    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Extract Query: "@jo" → query="jo"      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Search: Find users matching "jo"       │
│  - API call or local search             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Show Autocomplete: Dropdown with       │
│  matching users                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  User Selects: "@john"                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Insert: Replace "@jo" with "@john"     │
│  Store: { type: "user", id: "123" }     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Render: Display as rich component     │
│  Notify: Alert mentioned user           │
└─────────────────────────────────────────┘
```

---

## 🔍 Part 1: Detection & Parsing

### Approach 1: Real-time Character Monitoring

**How it works:**
- Monitor every keystroke in the input
- Detect `@` character
- Track cursor position
- Extract query text after `@`

**Implementation:**

```javascript
// React Hook Example
const useMentionDetection = (inputRef) => {
  const [mentionState, setMentionState] = useState({
    isActive: false,
    query: '',
    startIndex: null,
    endIndex: null,
  });

  const handleInputChange = (e) => {
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Find the last @ before cursor
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if there's a space after @ (mention ended)
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(' ');
      
      if (spaceIndex === -1) {
        // No space found, mention is active
        const query = textAfterAt;
        setMentionState({
          isActive: true,
          query,
          startIndex: lastAtIndex,
          endIndex: cursorPosition,
        });
      } else {
        // Space found, mention ended
        setMentionState({ isActive: false });
      }
    } else {
      setMentionState({ isActive: false });
    }
  };

  return { mentionState, handleInputChange };
};
```

### Approach 2: Regex-Based Parsing

**For extracting mentions from stored text:**

```javascript
// Parse mentions from text
const parseMentions = (text) => {
  // Pattern: @username or @{type:id} or @[display](id)
  const patterns = {
    // Slack-style: @U1234567
    slack: /<@([A-Z0-9]+)\|([^>]+)>/g,
    
    // GitHub-style: @username
    github: /@(\w+)/g,
    
    // Custom structured: @{user:123} or @{task:456}
    structured: /@\{(\w+):([^}]+)\}/g,
    
    // Display format: @[John Doe](user:123)
    display: /@\[([^\]]+)\]\((\w+):([^)]+)\)/g,
  };

  const mentions = [];
  let match;
  
  // Example: Extract structured mentions
  const regex = /@\{(\w+):([^}]+)\}/g;
  while ((match = regex.exec(text)) !== null) {
    mentions.push({
      type: match[1],      // 'user', 'task', etc.
      id: match[2],        // entity ID
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      raw: match[0],
    });
  }
  
  return mentions;
};
```

### Approach 3: ContentEditable with Range API

**For rich text editors (like your BlockEditor):**

```javascript
const detectMentionInContentEditable = (element) => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;
  
  const range = selection.getRangeAt(0);
  const textNode = range.startContainer;
  
  if (textNode.nodeType !== Node.TEXT_NODE) return null;
  
  const text = textNode.textContent;
  const offset = range.startOffset;
  
  // Find @ before cursor
  const textBefore = text.substring(0, offset);
  const lastAtIndex = textBefore.lastIndexOf('@');
  
  if (lastAtIndex === -1) return null;
  
  // Extract query
  const query = textBefore.substring(lastAtIndex + 1);
  
  // Check if mention is still active (no space)
  if (query.includes(' ')) return null;
  
  return {
    query,
    startIndex: lastAtIndex,
    node: textNode,
  };
};
```

---

## 🎨 Part 2: Autocomplete UI

### Component Structure

```jsx
// MentionAutocomplete Component
const MentionAutocomplete = ({ 
  query, 
  position, 
  items, 
  onSelect,
  onClose 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          Math.min(prev + 1, items.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(items[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items, onSelect, onClose]);
  
  if (!query || items.length === 0) return null;
  
  return (
    <Popover open={true}>
      <PopoverContent
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
        }}
        className="w-[300px] max-h-[200px] overflow-y-auto"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`p-2 cursor-pointer hover:bg-muted ${
              index === selectedIndex ? 'bg-muted' : ''
            }`}
            onClick={() => onSelect(item)}
          >
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={item.avatar} />
                <AvatarFallback>{item.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.email}
                </p>
              </div>
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};
```

### Positioning the Autocomplete

```javascript
// Calculate position relative to cursor
const getMentionPosition = (inputElement, cursorPosition) => {
  // Create a temporary span to measure text position
  const textBeforeCursor = inputElement.value.substring(0, cursorPosition);
  const span = document.createElement('span');
  span.textContent = textBeforeCursor;
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'pre-wrap';
  
  // Copy styles from input
  const styles = window.getComputedStyle(inputElement);
  span.style.font = styles.font;
  span.style.padding = styles.padding;
  span.style.border = styles.border;
  
  document.body.appendChild(span);
  
  const rect = inputElement.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();
  
  const position = {
    top: rect.top + spanRect.height - inputElement.scrollTop + 5,
    left: rect.left + spanRect.width,
  };
  
  document.body.removeChild(span);
  return position;
};
```

---

## 🔎 Part 3: Search & Lookup

### Client-Side Search (Small Datasets)

```javascript
// For < 1000 items, search locally
const searchUsers = (query, users) => {
  const lowerQuery = query.toLowerCase();
  return users
    .filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.username.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 10); // Limit results
};
```

### Server-Side Search (Large Datasets)

```javascript
// API hook for searching
const useMentionSearch = (query, type = 'user') => {
  return useQuery({
    queryKey: ['mentions', type, query],
    queryFn: async () => {
      const response = await axiosClient.get('/api/v1/mentions/search', {
        params: { q: query, type },
      });
      return response.data;
    },
    enabled: query.length > 0, // Only search if query exists
    staleTime: 30000, // Cache for 30 seconds
  });
};
```

### Backend Search Endpoint

```javascript
// Express.js example
router.get('/api/v1/mentions/search', async (req, res) => {
  const { q, type } = req.query;
  
  if (!q || q.length < 1) {
    return res.json({ data: [] });
  }
  
  let results = [];
  
  switch (type) {
    case 'user':
      results = await db.query(`
        SELECT id, name, email, avatar, username
        FROM users
        WHERE 
          name ILIKE $1 OR
          email ILIKE $1 OR
          username ILIKE $1
        LIMIT 10
      `, [`%${q}%`]);
      break;
      
    case 'task':
      results = await db.query(`
        SELECT id, title, status, project_id
        FROM tasks
        WHERE title ILIKE $1
        AND user_id = $2
        LIMIT 10
      `, [`%${q}%`, req.user.id]);
      break;
      
    case 'project':
      results = await db.query(`
        SELECT id, name, description
        FROM projects
        WHERE name ILIKE $1
        AND user_id = $2
        LIMIT 10
      `, [`%${q}%`, req.user.id]);
      break;
  }
  
  res.json({ data: results });
});
```

### Debounced Search

```javascript
// Prevent excessive API calls
import { useDebounce } from '@/hooks/useDebounce';

const MentionInput = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); // Wait 300ms
  
  const { data: results } = useMentionSearch(debouncedQuery);
  
  // ...
};
```

---

## 💾 Part 4: Storage Formats

### Option 1: Plain Text (Simple)

**Storage:**
```
"Hey @john, can you review @task-123?"
```

**Pros:**
- Simple
- Human-readable
- Easy to search

**Cons:**
- Hard to parse reliably
- No metadata
- Breaks if username changes

### Option 2: Structured Format (Recommended)

**Storage:**
```json
{
  "text": "Hey @[John Doe](user:123), can you review @[Fix bug](task:456)?",
  "mentions": [
    { "type": "user", "id": "123", "start": 4, "end": 30 },
    { "type": "task", "id": "456", "start": 52, "end": 75 }
  ]
}
```

**Or markdown-style:**
```
Hey @[John Doe](user:123), can you review @[Fix bug](task:456)?
```

### Option 3: Separate Mentions Table

**Database Schema:**
```sql
CREATE TABLE mentions (
  id UUID PRIMARY KEY,
  message_id UUID REFERENCES messages(id),
  entity_type VARCHAR(50), -- 'user', 'task', 'project'
  entity_id UUID,
  display_text VARCHAR(255),
  start_index INTEGER,
  end_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Storage:**
- Text stored as-is: `"Hey @john, review @task-123"`
- Mentions extracted and stored separately
- On render, replace with rich components

### Option 4: JSON with Embedded Data

**Storage:**
```json
{
  "content": "Hey @john, review @task-123",
  "entities": {
    "mentions": [
      {
        "type": "user",
        "id": "user_123",
        "display": "John Doe",
        "position": { "start": 4, "end": 9 }
      },
      {
        "type": "task",
        "id": "task_456",
        "display": "Fix critical bug",
        "position": { "start": 18, "end": 27 }
      }
    ]
  }
}
```

---

## 🎭 Part 5: Rendering Mentions

### React Component for Rendering

```jsx
// MentionRenderer Component
const MentionRenderer = ({ text, mentions }) => {
  if (!mentions || mentions.length === 0) {
    return <span>{text}</span>;
  }
  
  // Sort mentions by start index
  const sortedMentions = [...mentions].sort((a, b) => 
    a.startIndex - b.startIndex
  );
  
  const parts = [];
  let lastIndex = 0;
  
  sortedMentions.forEach((mention, index) => {
    // Add text before mention
    if (mention.startIndex > lastIndex) {
      parts.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, mention.startIndex)}
        </span>
      );
    }
    
    // Add mention component
    parts.push(
      <MentionBadge
        key={`mention-${index}`}
        type={mention.type}
        id={mention.id}
        display={mention.display || text.substring(mention.startIndex, mention.endIndex)}
      />
    );
    
    lastIndex = mention.endIndex;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end">{text.substring(lastIndex)}</span>
    );
  }
  
  return <>{parts}</>;
};

// MentionBadge Component
const MentionBadge = ({ type, id, display }) => {
  const getMentionData = () => {
    // Fetch mention data (user, task, etc.)
    // Could use React Query or context
  };
  
  const getStyles = () => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'task':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'project':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm font-medium ${getStyles()}`}
      data-mention-type={type}
      data-mention-id={id}
    >
      @{display}
    </span>
  );
};
```

### Markdown Parser Integration

```javascript
// For react-markdown
import ReactMarkdown from 'react-markdown';

const components = {
  // Custom component for mentions
  text: ({ node, ...props }) => {
    const text = node.value;
    const mentions = parseMentions(text);
    
    if (mentions.length === 0) {
      return <>{text}</>;
    }
    
    return <MentionRenderer text={text} mentions={mentions} />;
  },
};

<ReactMarkdown components={components}>
  {messageContent}
</ReactMarkdown>
```

---

## 🔔 Part 6: Notifications

### Extract Mentions Before Saving

```javascript
const extractMentions = (text, mentions) => {
  const extracted = [];
  
  mentions.forEach(mention => {
    if (mention.type === 'user') {
      extracted.push({
        userId: mention.id,
        type: 'mention',
        entityId: mention.messageId,
        entityType: 'message',
      });
    }
  });
  
  return extracted;
};
```

### Send Notifications

```javascript
// After saving message
const handleSaveMessage = async (text, mentions) => {
  // Save message
  const message = await saveMessage(text, mentions);
  
  // Extract user mentions
  const userMentions = mentions.filter(m => m.type === 'user');
  
  // Send notifications
  for (const mention of userMentions) {
    await notificationService.create({
      userId: mention.id,
      type: 'mention',
      title: `${currentUser.name} mentioned you`,
      message: `In: "${text.substring(0, 100)}..."`,
      link: `/messages/${message.id}`,
    });
  }
};
```

---

## 🎯 Part 7: Complete Implementation Example

### Custom Hook: `useMentions`

```javascript
// hooks/useMentions.js
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

export const useMentions = (inputRef, types = ['user']) => {
  const [mentionState, setMentionState] = useState({
    isActive: false,
    query: '',
    type: 'user',
    position: null,
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const debouncedQuery = useDebounce(mentionState.query, 300);
  
  // Detect mentions in input
  const handleInputChange = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    const textBefore = text.substring(0, cursorPos);
    
    // Check for @
    const lastAtIndex = textBefore.lastIndexOf('@');
    if (lastAtIndex === -1) {
      setMentionState({ isActive: false });
      return;
    }
    
    // Check for space (mention ended)
    const textAfterAt = textBefore.substring(lastAtIndex + 1);
    if (textAfterAt.includes(' ')) {
      setMentionState({ isActive: false });
      return;
    }
    
    // Detect type: @user, @task, @project
    const query = textAfterAt;
    let type = 'user';
    
    if (query.startsWith('task:')) {
      type = 'task';
      query = query.substring(5);
    } else if (query.startsWith('project:')) {
      type = 'project';
      query = query.substring(8);
    }
    
    // Calculate position
    const position = getMentionPosition(inputRef.current, cursorPos);
    
    setMentionState({
      isActive: true,
      query,
      type,
      position,
    });
  };
  
  // Search for mentions
  useEffect(() => {
    if (!mentionState.isActive || !debouncedQuery) {
      setSearchResults([]);
      return;
    }
    
    // API call or local search
    searchMentions(debouncedQuery, mentionState.type)
      .then(results => setSearchResults(results))
      .catch(() => setSearchResults([]));
  }, [debouncedQuery, mentionState.type, mentionState.isActive]);
  
  // Insert mention into input
  const insertMention = (item) => {
    const input = inputRef.current;
    const text = input.value;
    const cursorPos = input.selectionStart;
    const textBefore = text.substring(0, cursorPos);
    const lastAtIndex = textBefore.lastIndexOf('@');
    
    const beforeMention = text.substring(0, lastAtIndex);
    const afterMention = text.substring(cursorPos);
    
    // Format: @[Display Name](type:id)
    const mentionText = `@[${item.name}](${mentionState.type}:${item.id}) `;
    
    const newText = beforeMention + mentionText + afterMention;
    input.value = newText;
    
    // Set cursor after mention
    const newCursorPos = beforeMention.length + mentionText.length;
    input.setSelectionRange(newCursorPos, newCursorPos);
    input.focus();
    
    setMentionState({ isActive: false });
    
    // Trigger onChange event
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  };
  
  return {
    mentionState,
    searchResults,
    handleInputChange,
    insertMention,
  };
};
```

### Usage in Component

```jsx
// AIChatInputArea with Mentions
const AIChatInputArea = ({ handleSendMessage, status }) => {
  const inputRef = useRef(null);
  const {
    mentionState,
    searchResults,
    handleInputChange,
    insertMention,
  } = useMentions(inputRef, ['user', 'task', 'project']);
  
  return (
    <div className="relative">
      <InputGroupTextarea
        ref={inputRef}
        onChange={handleInputChange}
        // ... other props
      />
      
      {mentionState.isActive && (
        <MentionAutocomplete
          query={mentionState.query}
          position={mentionState.position}
          items={searchResults}
          onSelect={insertMention}
          onClose={() => setMentionState({ isActive: false })}
        />
      )}
    </div>
  );
};
```

---

## 🚀 Advanced Features

### 1. Multiple Mention Types

```javascript
// Support @user, @task, @project in same input
const detectMentionType = (query) => {
  if (query.startsWith('task:')) return 'task';
  if (query.startsWith('project:')) return 'project';
  if (query.startsWith('user:')) return 'user';
  
  // Default based on context or user preference
  return 'user';
};
```

### 2. Mention Suggestions Based on Context

```javascript
// Show relevant tasks when in task view
const getContextualMentions = (currentView) => {
  switch (currentView) {
    case 'task':
      return ['task', 'user', 'project'];
    case 'project':
      return ['project', 'user', 'task'];
    default:
      return ['user', 'task', 'project'];
  }
};
```

### 3. Rich Mention Previews

```jsx
// Show preview on hover
const MentionBadge = ({ mention }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  return (
    <span
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      @{mention.display}
      {showPreview && (
        <MentionPreview
          type={mention.type}
          id={mention.id}
        />
      )}
    </span>
  );
};
```

### 4. Mention Permissions

```javascript
// Check if user can mention entity
const canMention = async (userId, entityType, entityId) => {
  switch (entityType) {
    case 'user':
      // Check if users are in same workspace
      return await checkWorkspaceAccess(userId, entityId);
    case 'task':
      // Check task visibility
      return await checkTaskAccess(userId, entityId);
    default:
      return true;
  }
};
```

---

## 📚 Popular Libraries

### 1. **Mentions-Input** (Vanilla JS)
- Lightweight
- Framework agnostic
- Good for simple use cases

### 2. **react-mentions** (React)
- Popular React library
- Supports multiple mention types
- Good autocomplete

### 3. **Draft.js Plugins** (Rich Text)
- For Draft.js editors
- Rich text support
- Complex setup

### 4. **Slate.js Plugins** (Rich Text)
- For Slate.js editors
- Very flexible
- Good for complex editors

### 5. **Custom Implementation** (Recommended)
- Full control
- Fits your exact needs
- No external dependencies

---

## 🎨 UI/UX Best Practices

1. **Visual Feedback**
   - Highlight mentions differently
   - Show loading state during search
   - Indicate when mention is invalid

2. **Keyboard Navigation**
   - Arrow keys to navigate suggestions
   - Enter to select
   - Escape to close
   - Tab to complete

3. **Performance**
   - Debounce search queries
   - Limit results (10-20 max)
   - Cache recent searches
   - Virtualize long lists

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Focus management

5. **Mobile Support**
   - Touch-friendly dropdown
   - Prevent keyboard from covering suggestions
   - Swipe gestures

---

## 🔧 Implementation Checklist

- [ ] Detection: Monitor `@` character
- [ ] Parsing: Extract query and type
- [ ] Search: API or local search
- [ ] Autocomplete: Dropdown UI
- [ ] Keyboard: Navigation support
- [ ] Insertion: Replace query with mention
- [ ] Storage: Choose format (structured/plain)
- [ ] Rendering: Display as rich components
- [ ] Notifications: Alert mentioned entities
- [ ] Permissions: Check access rights
- [ ] Validation: Ensure mentions are valid
- [ ] Performance: Debounce, cache, limit results

---

## 💡 For Your Codebase

Based on your current setup, here's how to add mentions:

1. **Extend `AIChatInputArea`** with mention detection
2. **Create `useMentions` hook** for logic
3. **Add search endpoint** `/api/v1/mentions/search`
4. **Update message storage** to include mention metadata
5. **Render mentions** in `RenderAssistantMessageContent`
6. **Add notifications** when users are mentioned

Would you like me to implement a mention system for your AI chat?

---

*Last Updated: $(date)*
*Based on: Slack, Discord, GitHub, Notion, Linear, and industry best practices*
