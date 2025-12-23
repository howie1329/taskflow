export const notes = [
  {
    id: "work-meeting-notes",
    title: "Weekly Team Meeting",
    content: `## Team Standup - January 15, 2024

### What we accomplished:
- ✅ Completed user authentication flow
- ✅ Fixed the sidebar navigation bug
- ✅ Started working on the notes feature

### What we're working on:
- 🔄 Building the task management system
- 🔄 Setting up the database schema
- 🔄 Creating the project dashboard

### Blockers:
- Need design approval for the new UI components
- Waiting for API documentation from the backend team

### Next steps:
- Review pull requests by EOD
- Schedule demo for stakeholders
- Plan next sprint goals`,
    createdAt: "2024-01-15",
    category: "work",
    tags: ["meeting", "standup", "planning"],
  },
  {
    id: "project-ideas",
    title: "App Feature Ideas",
    content: `## New Features to Consider

### 🚀 High Priority
1. **Dark Mode Toggle**
   - User preference setting
   - System theme detection
   - Smooth transitions

2. **Keyboard Shortcuts**
   - Cmd/Ctrl + N for new note
   - Cmd/Ctrl + S for save
   - Cmd/Ctrl + F for search

3. **Note Templates**
   - Meeting notes template
   - Project planning template
   - Daily journal template

### 💡 Medium Priority
- Export to PDF/Markdown
- Note sharing and collaboration
- Mobile app version
- Offline support

### 📝 Low Priority
- Custom themes
- Advanced formatting options
- Integration with calendar apps`,
    createdAt: "2024-01-14",
    category: "planning",
    tags: ["features", "roadmap", "ideas"],
  },
  {
    id: "shopping-list",
    title: "Grocery Shopping",
    content: `## Grocery List - January 16

###  Dairyå
- [ ] Milk (2% - 1 gallon)
- [ ] Greek yogurt (vanilla)
- [ ] Cheddar cheese (block)
- [ ] Butter (unsalted)

### 🥩 Protein
- [ ] Chicken breasts (2 lbs)
- [ ] Ground beef (1 lb)
- [ ] Eggs (dozen)
- [ ] Salmon fillets (2)

### 🥬 Produce
- [ ] Bananas
- [ ] Spinach (fresh)
- [ ] Tomatoes (cherry)
- [ ] Onions (yellow)
- [ ] Garlic

###  Pantry
- [ ] Bread (whole wheat)
- [ ] Pasta (penne)
- [ ] Olive oil
- [ ] Rice (brown)

###  Notes:
- Check for sales on meat
- Don't forget reusable bags
- Budget: $80 max`,
    createdAt: "2024-01-13",
    category: "personal",
    tags: ["shopping", "groceries", "list"],
  },
  {
    id: "learning-notes",
    title: "React Hooks Deep Dive",
    content: `## React Hooks - Advanced Concepts

### useEffect Dependencies
// ❌ Bad - missing dependency
useEffect(() => {
  fetchData(userId);
}, []); // userId not included

// ✅ Good - proper dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

### Custom Hooks Pattern
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

### Key Takeaways:
- Always include all dependencies in useEffect
- Custom hooks should start with "use"
- Hooks can't be called conditionally
- Use useCallback/useMemo for performance optimization`,
    createdAt: "2024-01-12",
    category: "learning",
    tags: ["react", "hooks", "javascript", "tutorial"],
  },
  {
    id: "daily-journal",
    title: "Daily Reflection - January 15",
    content: `## Today's Thoughts

### 🌅 Morning
Woke up feeling refreshed today. The new sleep schedule is really working well. Had a great workout session and felt energized for the day ahead.

### 💼 Work
Productive coding session this morning. Finally solved that tricky bug with the sidebar navigation. It's amazing how sometimes the solution is simpler than you think. Team meeting went well - everyone seems excited about the new features we're building.

### 🍽️ Afternoon
Lunch with Sarah was nice. We discussed the upcoming project and she had some great insights about user experience. Sometimes stepping away from the code helps you see things differently.

###  Evening
Spent some time reading that new book on productivity. The concept of "deep work" really resonates with me. Need to implement more focused coding sessions without distractions.

###  Tomorrow's Goals:
- [ ] Review the new design mockups
- [ ] Start working on the database integration
- [ ] Call mom (it's been a week)
- [ ] Plan weekend activities

### 💭 Gratitude:
- Having a supportive team at work
- Good health and energy
- Learning new things every day
- The beautiful weather we've been having`,
    createdAt: "2024-01-15",
    category: "personal",
    tags: ["journal", "reflection", "daily", "gratitude"],
  },
];
