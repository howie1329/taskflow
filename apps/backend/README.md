# TaskFlow Backend API

A robust, scalable REST API and WebSocket server for TaskFlow, a modern productivity application. Built with Express.js, PostgreSQL, and real-time capabilities powered by Socket.io and BullMQ.

## 🚀 Features

### Core API Capabilities

- **RESTful API**: Comprehensive REST endpoints for tasks, notes, projects, conversations, and notifications
- **Real-Time Communication**: WebSocket support via Socket.io for live updates and notifications
- **AI Integration**: Multi-provider AI support (OpenAI, Google Gemini, OpenRouter) with streaming responses
- **Background Jobs**: BullMQ-powered job queue for async processing (summarization, embeddings, notifications)
- **Smart Caching**: Redis-based caching layer for improved performance
- **Vector Search**: PostgreSQL vector similarity search for semantic search capabilities
- **Conversation Management**: AI chat with conversation summarization and context windowing
- **Authentication**: Clerk-based authentication middleware for secure endpoints

### Technical Highlights

- **Clean Architecture**: Separation of concerns with controllers, services, and database operations
- **Type-Safe Database**: Drizzle ORM with PostgreSQL for type-safe queries
- **Streaming Responses**: AI streaming with Vercel AI SDK for real-time user feedback
- **Job Queue System**: Background processing for AI operations and notifications
- **Embedding Service**: Vector embeddings for semantic search across tasks, notes, and messages
- **Smart Context**: Context-aware AI responses using embedding-based similarity search

## 🛠️ Tech Stack

### Core Technologies

- **Runtime**: Node.js with Express.js 5
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis (ioredis)
- **Real-Time**: Socket.io Server
- **Job Queue**: BullMQ
- **AI SDK**: Vercel AI SDK with streaming support
- **Authentication**: Clerk Express middleware

### AI Providers

- OpenAI (via OpenRouter)
- Google Gemini
- OpenRouter (multi-provider gateway)

### Database Features

- Vector similarity search (pgvector)
- Foreign key relationships
- JSON/JSONB support for flexible data structures
- Timestamp tracking

## 📁 Project Structure

```
taskflow-backend/
├── controllers/          # Request handlers
│   ├── ai.js           # AI-related endpoints
│   ├── conversations.js # Conversation management
│   ├── notes.js        # Note CRUD operations
│   ├── notifications.js # Notification management
│   ├── projects.js     # Project operations
│   ├── search.js        # Smart search endpoints
│   ├── subtasks.js     # Subtask operations
│   └── tasks.js        # Task CRUD operations
├── services/            # Business logic layer
│   ├── ai.js           # AI services (embeddings, chat)
│   ├── cache.js        # Redis caching service
│   ├── chat/           # Chat-specific services
│   │   ├── MessageService.js
│   │   ├── SmartContextService.js
│   │   └── SummaryService.js
│   ├── conversations.js # Conversation business logic
│   ├── jobs.js         # BullMQ job definitions
│   ├── notes.js        # Note business logic
│   ├── notifications.js # Notification service
│   ├── projects.js     # Project service
│   ├── search.js        # Search service
│   ├── subtasks.js     # Subtask service
│   └── tasks.js        # Task business logic
├── db/                  # Database layer
│   ├── operations/     # Database CRUD operations
│   ├── relations.js    # Drizzle relations
│   └── schema.js       # Database schema definitions
├── routes/              # API route definitions
│   └── v1/             # API version 1 routes
├── middleware/          # Express middleware
│   └── auth.js         # Authentication middleware
├── sockets/             # WebSocket handlers
│   └── index.js        # Socket.io initialization
├── utils/               # Utility functions
│   ├── AIPrompts/      # AI prompt templates
│   ├── AiTools/        # AI tool definitions
│   ├── redisClient.js  # Redis client setup
│   └── supabase.js    # Supabase client
└── index.js             # Application entry point
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (with pgvector extension)
- Redis server
- Clerk account for authentication
- AI API keys (OpenAI, Google, or OpenRouter)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd taskflow-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/taskflow

   # Redis
   REDIS_URL=redis://localhost:6379

   # Authentication
   CLERK_SECRET_KEY=your_clerk_secret_key

   # AI Providers
   OPENAI_API_KEY=your_openai_key
   GOOGLE_AI_KEY=your_google_key
   OPENROUTER_AI_KEY=your_openrouter_key

   # Supabase (optional, if using Supabase)
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key

   # CORS Configuration
   # Comma-separated list of allowed origins
   # Supports wildcard patterns for subdomains (e.g., *.vercel.app)
   # If not set, defaults to development origins
   ALLOWED_ORIGINS=https://taskflow-git-dev-howie1329s-projects.vercel.app,http://localhost:3000,http://localhost:3001
   ```

4. **Set up the database**

   Ensure PostgreSQL has the `pgvector` extension installed:

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

   Run database migrations:

   ```bash
   npm run db:push
   ```

   Or use Drizzle Studio to inspect the database:

   ```bash
   npm run db:studio
   ```

5. **Start Redis**

   Make sure Redis is running locally or update `REDIS_URL` to point to your Redis instance.

6. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

### Docker Setup

Build and run with Docker Compose:

```bash
docker compose up --build
```

## 📡 API Endpoints

### Authentication

All endpoints require authentication via Clerk. Include the Clerk session token in the request headers.

### Tasks

- `GET /api/v1/tasks/user` - Get all tasks for authenticated user
- `GET /api/v1/tasks/user/:taskId` - Get single task by ID
- `GET /api/v1/tasks/subtasks/:taskId` - Get subtasks for a task
- `GET /api/v1/tasks/notes/:taskId` - Get notes linked to a task
- `GET /api/v1/tasks/project/:projectId` - Get tasks by project
- `POST /api/v1/tasks/create` - Create a new task
- `PATCH /api/v1/tasks/update/:taskId` - Update a task
- `PATCH /api/v1/tasks/complete/:taskId` - Mark task as complete
- `PATCH /api/v1/tasks/incomplete/:taskId` - Mark task as incomplete
- `DELETE /api/v1/tasks/delete/:taskId` - Delete a task

### Notes

- `GET /api/v1/notes/user` - Get all notes for authenticated user
- `GET /api/v1/notes/:noteId` - Get single note by ID
- `POST /api/v1/notes/create` - Create a new note
- `PATCH /api/v1/notes/:noteId` - Update a note
- `DELETE /api/v1/notes/:noteId` - Delete a note

### Projects

- `GET /api/v1/projects/user` - Get all projects for authenticated user
- `GET /api/v1/projects/:projectId` - Get single project by ID
- `POST /api/v1/projects/create` - Create a new project

### Subtasks

- `POST /api/v1/subtasks/create` - Create a subtask
- `PATCH /api/v1/subtasks/update/:subtaskId` - Update a subtask
- `PATCH /api/v1/subtasks/complete/:subtaskId` - Mark subtask as complete
- `PATCH /api/v1/subtasks/incomplete/:subtaskId` - Mark subtask as incomplete
- `DELETE /api/v1/subtasks/delete/:subtaskId` - Delete a subtask

### Conversations & AI Chat

- `GET /api/v1/conversations` - Get all conversations for user
- `GET /api/v1/conversations/:id` - Get single conversation
- `GET /api/v1/conversations/:id/messages` - Get messages for conversation
- `POST /api/v1/conversations/create` - Create a new conversation
- `POST /api/v1/conversations/:id/messages` - Send message (streaming response)
- `DELETE /api/v1/conversations/:id` - Delete a conversation

### AI Services

- `GET /api/v1/ai/models` - Get available AI models
- `POST /api/v1/ai/create-note` - AI-powered note creation

### Search

- `POST /api/v1/smart-search/search` - Semantic search across tasks, notes, and messages

### Notifications

- `GET /api/v1/notifications/user` - Get all notifications for user
- `POST /api/v1/notifications/create` - Create a notification
- `PATCH /api/v1/notifications/:notificationId` - Mark notification as read
- `DELETE /api/v1/notifications/:notificationId` - Delete a notification

## 🔌 WebSocket Events

### Client → Server

- Connection with `userId` in handshake headers/auth

### Server → Client

- `notification-created` - New notification created
- `note-created` - Note created
- `note-updated` - Note updated
- `note-deleted` - Note deleted
- `project-created` - Project created
- `notifications-clean-up` - Notifications cleanup completed

## 🏗️ Architecture

### Request Flow

1. **Request** → Express middleware (CORS, JSON parsing, Clerk auth)
2. **Route** → Route handler matches endpoint
3. **Controller** → Validates request, extracts user context
4. **Service** → Business logic, data transformation
5. **Database Operations** → Drizzle ORM queries
6. **Response** → JSON response or streaming (for AI endpoints)

### Background Jobs

- **AI Summarization**: Summarizes long conversations to reduce token usage
- **Message Embeddings**: Creates vector embeddings for semantic search
- **Notifications**: Async notification creation and delivery
- **Notification Cleanup**: Scheduled cleanup of read notifications

### Caching Strategy

- Redis caching for frequently accessed data (tasks)
- Cache invalidation on write operations
- Fallback to database on cache miss

### AI Architecture

- **Main Agent**: Orchestrates conversation flow and tool selection
- **Task Agent**: Specialized agent for task operations
- **Note Agent**: Specialized agent for note operations
- **Streaming**: Real-time response streaming via Vercel AI SDK
- **Context Window**: Smart context management with summarization
- **Embeddings**: Vector embeddings for semantic similarity search

## 🔧 Configuration

### Database Schema

The database uses Drizzle ORM with PostgreSQL. Key tables:

- `tasks` - Task management with vector embeddings
- `notes` - Rich text notes with block-based content
- `projects` - Project workspaces
- `subtasks` - Subtask tracking
- `conversations` - AI conversation sessions
- `vercel_messages` - AI chat messages with embeddings
- `notifications` - User notifications
- `tags` & `tag_relations` - Tagging system

### Environment Variables

See the `.env` example in the Getting Started section. All variables are required except Supabase (optional).

## 📊 Performance Optimizations

- Redis caching for task queries
- Vector similarity search for fast semantic search
- Background job processing for heavy operations
- Connection pooling for database queries
- Streaming responses for AI endpoints

## 🔒 Security

- Clerk authentication on all endpoints
- User-scoped data access (users can only access their own data)
- CORS configuration for allowed origins
- Input validation via Zod schemas
- SQL injection prevention via Drizzle ORM

## 🧪 Development

### Database Migrations

```bash
# Push schema changes to database
npm run db:push

# Generate migration files
npm run db:generate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run docker` - Build and run with Docker Compose

## 📝 License

This project is private and proprietary.

## 👤 Author

Howard Thomas
