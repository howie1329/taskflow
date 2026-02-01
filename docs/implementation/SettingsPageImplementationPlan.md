# Settings Page Implementation Plan

## Overview

This document outlines the complete implementation plan for the settings page in `app/web`, enabling users to manage their profiles and AI model preferences.

## Features

### User Profile Management

- **Fields:** First name, last name, email address
- **Validation:** Minimal validation (required fields, email format, name length limits)
- **Updates:** Real-time saving with success feedback

### AI Model Selection

- **Integration:** OpenRouter API with hybrid approach
- **Control:** Allowlist-based model filtering
- **Caching:** 24-hour TTL with manual refresh option
- **UI:** Searchable, filterable model list with pricing and context information

## Database Schema

### Complete Convex Schema Extension

```typescript
// convex/schema.ts
export default defineSchema({
  ...authTables,

  // User identity information
  userProfiles: defineTable({
    userId: v.id("users"), // Reference to auth user
    firstName: v.string(), // Max 50 chars
    lastName: v.string(), // Max 50 chars
    email: v.string(), // Email address
    // Future: avatarUrl, bio, timezone, language
  }).index("by_user", ["userId"]),

  // User preferences and settings
  userPreferences: defineTable({
    userId: v.id("users"), // Reference to auth user
    defaultAIModel: v.string(), // OpenRouter model ID
    // Future: theme, notifications, privacy settings
  }).index("by_user", ["userId"]),

  // OpenRouter model allowlist - YOUR control layer
  modelAllowlist: defineTable({
    modelId: v.string(), // OpenRouter model ID (e.g., "openai/gpt-4")
    category: v.optional(v.string()), // Your categorization: "general", "coding", "creative"
    customDescription: v.optional(v.string()), // Your user-friendly descriptions
    recommended: v.boolean(), // Highlight popular choices
    isActive: v.boolean(), // Enable/disable user access
    maxCostPerRequest: v.optional(v.number()), // Cost controls if needed
  }).index("by_active", ["isActive"]),

  // Cached model data from OpenRouter (24-hour TTL)
  modelCache: defineTable({
    modelId: v.string(), // OpenRouter model ID
    name: v.string(), // Display name from API
    provider: v.string(), // Provider from API
    description: v.string(), // API description + your custom description
    contextLength: v.number(), // From API
    pricing: v.object({
      // From API
      prompt: v.string(),
      completion: v.string(),
    }),
    category: v.string(), // Your category from allowlist
    customDescription: v.string(), // Your description from allowlist
    recommended: v.boolean(), // Your recommendation from allowlist
    lastUpdated: v.number(), // Timestamp for cache invalidation
  })
    .index("by_model", ["modelId"])
    .index("by_category", ["category"])
    .index("by_recommended", ["recommended"]),
});
```

### Initial Allowlist Setup

```typescript
// Seed data for modelAllowlist table
const initialAllowlist = [
  {
    modelId: "openai/gpt-4",
    category: "general",
    customDescription: "Most capable model for complex tasks",
    recommended: true,
    isActive: true,
  },
  {
    modelId: "anthropic/claude-3.5-sonnet",
    category: "general",
    customDescription: "Excellent for writing and analysis",
    recommended: true,
    isActive: true,
  },
  {
    modelId: "google/gemini-pro",
    category: "general",
    customDescription: "Google's flagship model",
    recommended: false,
    isActive: true,
  },
  // Add your specific models here
];
```

## Component Architecture

### File Structure

```
app/app/settings/
├── page.tsx                     # Main settings page with tabs
├── components/
│   ├── settings-layout.tsx      # Tab container and navigation
│   ├── profile-tab/
│   │   ├── profile-tab.tsx      # Profile editing main component
│   │   ├── profile-form.tsx     # Profile form with validation
│   │   └── profile-field.tsx    # Reusable profile input field
│   ├── preferences-tab/
│   │   ├── preferences-tab.tsx   # Main preferences component
│   │   └── ai-model-selector.tsx # AI model selection component
│   └── ai-settings-tab/
│       ├── ai-settings-tab.tsx   # AI settings main component
│       ├── model-list.tsx        # Model list with search/filter
│       ├── model-card.tsx        # Individual model display
│       └── model-details.tsx     # Expanded model information
└── hooks/
    ├── use-user-profile.ts       # Profile data management
    ├── use-user-preferences.ts   # Preferences data management
    ├── use-ai-models.ts          # AI models data and caching
    └── use-settings-form.ts      # Form state and validation
```

### Component Design Patterns

#### Main Settings Page (page.tsx)

```typescript
export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, preferences, and AI settings
          </p>
        </div>
      </div>
      <SettingsLayout />
    </div>
  );
}
```

#### Settings Layout (settings-layout.tsx)

- Uses shadcn/ui Tabs component (needs to be added)
- Three tabs: Profile, Preferences, AI Settings
- Responsive design with proper spacing
- Loading states for each tab content

## OpenRouter Integration Strategy

### Hybrid Approach Benefits

✅ **Always Current** - Real-time pricing, context windows, model IDs
✅ **Automatic Updates** - New models appear immediately when allowed
✅ **Zero Maintenance** - No need to manually update pricing/models
✅ **Full Control** - Still decide which models users can access
✅ **Performance Optimized** - Cached data reduces API calls
✅ **Reliability** - Always works with latest OpenRouter API changes

### Core Convex Functions

```typescript
// 1. Sync models from OpenRouter (mutation)
export const syncModels = mutation({
  handler: async (ctx) => {
    // Fetch from OpenRouter API
    // Filter through active allowlist
    // Update cache with fresh data
    // Return updated model count
  },
});

// 2. Get available models (query)
export const getAvailableModels = query({
  handler: async (ctx) => {
    // Check cache freshness
    // If stale, trigger background sync
    // Return cached models (filtered by allowlist)
    // Include your custom metadata
  },
});

// 3. Profile management
export const getUserProfile = query({
  handler: async (ctx, userId) => {
    // Fetch user profile with fallback to auth data
  },
});

export const updateUserProfile = mutation({
  handler: async (ctx, userId, profile) => {
    // Update profile with validation
    // Return updated data
  },
});

// 4. Preferences management
export const getUserPreferences = query({
  handler: async (ctx, userId) => {
    // Fetch user preferences
  },
});

export const updateUserPreferences = mutation({
  handler: async (ctx, userId, preferences) => {
    // Update preferences with validation
    // Return updated data
  },
});
```

### Caching Strategy

- **Cache Duration:** 24 hours with manual refresh option
- **Cache Invalidation:** Automatic refresh when expired
- **Fallback:** Use cached data if API is temporarily unavailable
- **Sync Trigger:** Admin can force refresh for new models

## User Experience & Validation

### Form Validation (Minimal Rules)

- **Email:** Required, basic email format validation
- **First Name:** Required, max 50 characters
- **Last Name:** Required, max 50 characters
- **AI Model:** Required selection

### UX Flow

1. **Load State:** Skeleton loaders while fetching data
2. **Edit Mode:** Direct editing with auto-save or save button
3. **Validation:** Real-time validation with inline errors
4. **Success Feedback:** Toast notifications using sonner
5. **Error Handling:** Graceful error messages with retry options

### Form Patterns

- Use existing Field components from shadcn/ui
- Consistent with existing design language
- Responsive layout with proper spacing
- Accessible form controls with proper labels

## Implementation Phases

### Phase 1: Foundation (Critical Path)

**Priority: HIGH** | **Estimated: 2-3 days**

#### 1.1 Database Setup

- [ ] Update `convex/schema.ts` with complete schema
- [ ] Create initial model allowlist seed data
- [ ] Set up database indexes and relationships

#### 1.2 Core Convex Functions

- [ ] Implement model sync from OpenRouter API
- [ ] Create profile CRUD operations
- [ ] Create preferences CRUD operations
- [ ] Add error handling and validation

#### 1.3 UI Foundation

- [ ] Add shadcn/ui Tabs component
- [ ] Create main settings page structure
- [ ] Set up settings layout with tab navigation
- [ ] Create basic loading states

### Phase 2: Profile Management (Critical Path)

**Priority: HIGH** | **Estimated: 2 days**

#### 2.1 Profile Tab Components

- [ ] Create profile form component
- [ ] Implement field validation (minimal rules)
- [ ] Add save/update functionality
- [ ] Create custom hooks for profile data

#### 2.2 User Experience

- [ ] Add loading and error states
- [ ] Implement toast notifications for feedback
- [ ] Add form state management
- [ ] Test responsive design

### Phase 3: AI Settings (High Priority)

**Priority: HIGH** | **Estimated: 3-4 days**

#### 3.1 Model Management

- [ ] Implement OpenRouter model fetching
- [ ] Create model caching logic (24-hour TTL)
- [ ] Set up allowlist filtering
- [ ] Add manual refresh functionality

#### 3.2 AI Settings Components

- [ ] Create model list with search/filter
- [ ] Design model card components
- [ ] Implement model selection interface
- [ ] Add pricing and context information display

#### 3.3 Preferences Integration

- [ ] Connect model selection to user preferences
- [ ] Save default model choice
- [ ] Add recommendation highlighting
- [ ] Test model selection flow

### Phase 4: Polish & Enhancement (Medium Priority)

**Priority: MEDIUM** | **Estimated: 2-3 days**

#### 4.1 Additional Features

- [ ] Avatar upload functionality
- [ ] Theme preference settings
- [ ] Notification preferences
- [ ] Account management options

#### 4.2 UX Improvements

- [ ] Add auto-save functionality
- [ ] Implement better loading skeletons
- [ ] Add keyboard navigation
- [ ] Improve mobile responsiveness

#### 4.3 Error Handling & Edge Cases

- [ ] Handle API failures gracefully
- [ ] Add retry mechanisms
- [ ] Implement proper error boundaries
- [ ] Add accessibility improvements

### Phase 5: Testing & Optimization (Low Priority)

**Priority: LOW** | **Estimated: 1-2 days**

#### 5.1 Performance

- [ ] Optimize model caching
- [ ] Add performance monitoring
- [ ] Optimize bundle size
- [ ] Add lazy loading where appropriate

#### 5.2 Quality Assurance

- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Accessibility audit
- [ ] User acceptance testing

## Required Dependencies & Setup

### Need to Add

- shadcn/ui Tabs component
- OpenRouter API key configuration
- Form validation library (if needed)
- Additional environment variables

### Configuration Files

- Update `.env.local` with OpenRouter API key
- Add Convex environment variables
- Update package.json if needed

## Technical Benefits

### Database Architecture

- **Separation of Concerns:** Profiles (identity) vs Preferences (settings)
- **Scalability:** Easy to extend with additional settings
- **Performance:** Proper indexing for efficient queries
- **Flexibility:** Future-proof schema design

### OpenRouter Integration

- **Always Current:** Fresh data from OpenRouter API
- **Full Control:** Your allowlist determines what users see
- **Zero Maintenance:** No manual pricing/model updates needed
- **Performance Optimized:** Smart caching reduces API calls
- **Scalable Architecture:** Easy to extend with additional settings

## Summary

This implementation plan provides a comprehensive settings page that:

✅ **Manages User Profiles** - First name, last name, email editing with minimal validation
✅ **Controls AI Access** - Hybrid OpenRouter integration with your allowlist filtering
✅ **Modern UI** - Tabbed interface following existing design patterns
✅ **Scalable Architecture** - Easy to extend with additional features
✅ **Performance Optimized** - Smart caching and efficient data fetching
✅ **User-Friendly** - Intuitive interface with proper feedback and error handling

The plan is structured in phases to enable incremental development and testing, with the most critical functionality implemented first.
