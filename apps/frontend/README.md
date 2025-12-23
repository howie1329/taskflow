# TaskFlow

A modern, AI-powered productivity application that combines task management, note-taking, and intelligent assistance in a unified workspace. TaskFlow helps users organize their work, capture ideas, and stay productive through natural language interactions with an AI assistant.

## 🚀 Features

### Core Functionality

- **Task Management**: Full-featured Kanban board with drag-and-drop, subtasks, priorities, due dates, and project organization
- **Rich Note-Taking**: Block-based rich text editor with markdown support, tags, and search capabilities
- **AI-Powered Assistant**: Conversational AI that can create, update, and manage tasks and notes through natural language
- **Project Workspaces**: Organize tasks and notes into projects with team collaboration support
- **Real-Time Updates**: WebSocket-powered real-time synchronization across devices
- **Smart Search**: Global search across tasks and notes with advanced filtering
- **Calendar Integration**: Schedule view for tasks and events
- **Notifications**: Real-time in-app notifications with Redis-backed job queue

### Technical Highlights

- **Clean Architecture**: Separation of concerns with presentation, hooks, and service layers
- **Real-Time Communication**: Socket.io for live updates and notifications
- **AI Integration**: Multi-provider AI support (OpenAI, Google Gemini, OpenRouter) with streaming responses
- **Performance**: Optimized with React Query caching, Redis caching, and efficient database queries
- **Modern UI**: Built with shadcn/ui components, Tailwind CSS, and responsive design
- **Type Safety**: Zod validation schemas throughout the application

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS 4 with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand for global state, React Query for server state
- **Real-Time**: Socket.io Client
- **Rich Text Editor**: BlockNote
- **Animations**: Motion (Framer Motion)
- **Authentication**: Clerk

### Backend

- **Runtime**: Node.js with Express.js 5
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis with ioredis
- **Real-Time**: Socket.io Server
- **Job Queue**: BullMQ for background tasks
- **AI SDK**: Vercel AI SDK with streaming support
- **Authentication**: Clerk Express middleware

### Infrastructure

- **Database Hosting**: Supabase (PostgreSQL)
- **Deployment**: Docker containerization support
- **Package Management**: npm

## 📁 Project Structure

```
taskflow/                    # Frontend application
├── src/
│   ├── app/                 # Next.js app router pages
│   │   └── mainview/        # Main application views
│   │       ├── aichat/      # AI chat interface
│   │       ├── inbox/       # Inbox view
│   │       ├── notes/        # Notes management
│   │       ├── projects/    # Project workspaces
│   │       ├── schedule/    # Calendar view
│   │       └── task/        # Task management
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   │   ├── ai/             # AI-related hooks
│   │   ├── notes/          # Note management hooks
│   │   ├── tasks/          # Task management hooks
│   │   └── projects/      # Project hooks
│   ├── lib/                # Utility libraries
│   └── presentation/       # Presentation layer components

taskflow-backend/            # Backend API server
├── controllers/             # Request handlers
├── services/                # Business logic layer
│   └── chat/               # AI chat services
├── db/                      # Database schema and operations
│   └── operations/         # Database CRUD operations
├── routes/                  # API route definitions
├── middleware/              # Express middleware
├── utils/                   # Utility functions
│   ├── AIPrompts/         # AI prompt templates
│   └── AiTools/           # AI tool definitions
└── sockets/                # WebSocket handlers
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Redis server
- Clerk account for authentication
- AI API keys (OpenAI, Google, or OpenRouter)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd taskflow
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd ../taskflow-backend
   npm install
   ```

4. **Set up environment variables**

   Frontend (`.env.local`):

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

   Backend (`.env`):

   ```env
   DATABASE_URL=your_postgres_connection_string
   REDIS_URL=your_redis_connection_string
   CLERK_SECRET_KEY=your_clerk_secret
   OPENAI_API_KEY=your_openai_key
   GOOGLE_API_KEY=your_google_key
   ```

5. **Set up the database**

   ```bash
   cd taskflow-backend
   npm run db:push
   ```

6. **Start the development servers**

   Backend:

   ```bash
   cd taskflow-backend
   npm run dev
   ```

   Frontend (in a new terminal):

   ```bash
   cd taskflow
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Setup

Alternatively, use Docker Compose:

```bash
cd taskflow-backend
docker compose up --build
```

## 🏗️ Architecture

TaskFlow follows a clean architecture pattern with clear separation of concerns:

- **Presentation Layer**: React components and UI logic
- **Application Layer**: Custom hooks that orchestrate business logic
- **Domain Layer**: Business rules and entity models
- **Infrastructure Layer**: API clients, database operations, and external services

The AI chat system uses a tool-based architecture where the AI agent can call specific tools (TaskAgent, NoteAgent) to interact with the application data, ensuring reliable and controlled operations.

## 🎯 Key Features in Detail

### AI Assistant

- Natural language task and note creation
- Context-aware conversations with conversation history
- Multi-model support (GPT-4, Gemini, Claude)
- Streaming responses for real-time feedback
- Smart context retrieval using embedding search

### Task Management

- Kanban board with drag-and-drop
- Subtask tracking with progress indicators
- Priority levels and due date management
- Project organization and filtering
- Bulk operations

### Notes System

- Block-based rich text editor
- Markdown support
- Tagging and categorization
- Full-text search
- Task linking and cross-references

## 🔮 Future Enhancements

- Mobile app (React Native)
- Advanced AI features (voice input, proactive suggestions)
- Team collaboration and sharing
- Calendar integrations (Google Calendar, Outlook)
- Advanced analytics and productivity insights
- Offline support with sync
- Custom automation workflows

## 📝 License

This project is private and proprietary.

## 👤 Author

Howard Thomas
