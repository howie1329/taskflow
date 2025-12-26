# Task Schema Update - Notes Field Addition

## Overview
This document describes the addition of a `notes` field to the tasks table to support the note-taking functionality in the TaskCardSheet component.

## Schema Changes

### Updated Schema Definition
The `tasks` table in `/workspace/apps/backend/db/schema.js` has been updated to include:

```javascript
notes: text(),
```

This field is added at line 151 in the tasks schema definition.

### Field Specification
- **Field Name:** `notes`
- **Type:** `text` (unlimited length text field)
- **Nullable:** Yes (allows NULL values)
- **Default:** NULL
- **Description:** Stores additional notes or comments about a task

## Database Migration

### Migration File
A SQL migration file has been created at:
`/workspace/apps/backend/MIGRATION_ADD_NOTES.sql`

### Migration Content
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;
COMMENT ON COLUMN tasks.notes IS 'Additional notes or comments about the task';
```

### How to Apply Migration
Run the migration SQL against your PostgreSQL database:

```bash
# Option 1: Using psql
psql -d your_database_name -f /workspace/apps/backend/MIGRATION_ADD_NOTES.sql

# Option 2: Using drizzle-kit (if DATABASE_URL is configured)
cd /workspace/apps/backend
npm run db:push

# Option 3: Execute in database admin tool
# Copy and paste the SQL from MIGRATION_ADD_NOTES.sql
```

## Frontend Changes Already Applied

The frontend TaskCardSheet component has been updated to:
1. ✅ Bind the notes textarea to state (`value={notes}`)
2. ✅ Add onChange handler (`handleNotesChange`)
3. ✅ Implement debounced auto-save (1 second delay)
4. ✅ Sync with selectedTask updates via useEffect

## Backend Compatibility

### Existing Code Support
The backend already supports the notes field through:

1. **Task Operations** (`/workspace/apps/backend/db/operations/tasks.js`):
   - The `update()` function accepts any fields in updates object
   - Line 49: `.set({ ...updates, updatedAt: new Date().toISOString() })`

2. **Task Service** (`/workspace/apps/backend/services/tasks.js`):
   - `updateTask()` passes updates directly to taskOps.update()

3. **Task Controller** (`/workspace/apps/backend/controllers/tasks.js`):
   - `PATCH /api/v1/tasks/update/:taskId` endpoint handles any task fields

### No Backend Code Changes Required
Because the backend uses a flexible update pattern, no additional code changes are needed. Once the database column is added, the notes field will work automatically.

## Testing Checklist

After applying the migration, test the following:

- [ ] Open a task card sheet
- [ ] Type notes in the notes textarea
- [ ] Wait 1 second for auto-save
- [ ] Close and reopen the task
- [ ] Verify notes are persisted
- [ ] Edit existing notes
- [ ] Verify changes are saved
- [ ] Test with empty notes (should save as NULL)

## Rollback Procedure

If you need to remove the notes field:

```sql
ALTER TABLE tasks DROP COLUMN IF EXISTS notes;
```

## Additional Notes

### Why Text Type?
- Unlimited length for detailed notes
- No character limit restrictions
- Efficient for PostgreSQL text operations
- Can be indexed if needed in the future

### Future Enhancements
Consider these potential improvements:
1. Add rich text formatting support
2. Add notes versioning/history
3. Add notes search functionality
4. Add notes character count display
5. Add notes templates

## Related Files Modified

1. `/workspace/apps/backend/db/schema.js` - Added notes field to tasks table
2. `/workspace/apps/frontend/src/presentation/components/task/TaskCardSheet.js` - Added notes functionality
3. `/workspace/apps/backend/MIGRATION_ADD_NOTES.sql` - Migration script

## Status

- ✅ Schema updated
- ✅ Frontend code updated
- ✅ Migration script created
- ⏳ Migration needs to be applied to database
- ⏳ Testing required after migration

## Questions or Issues

If you encounter issues after applying the migration:

1. Verify the column was added: `\d tasks` in psql
2. Check column type: Should be `text`
3. Test with simple update: `UPDATE tasks SET notes = 'test' WHERE id = 'some-id';`
4. Check backend logs for any errors when updating tasks
