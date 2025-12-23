# TaskFlow Monorepo

A modern, AI-powered productivity application monorepo combining task management, note-taking, and intelligent assistance in a unified workspace. Built with Next.js, Express.js, and powered by Turbo for efficient monorepo management.

## 📋 Overview

TaskFlow is a comprehensive productivity platform that helps users organize their work, capture ideas, and stay productive through natural language interactions with an AI assistant. The monorepo contains the frontend application, backend API, and shared packages.

## 🏗️ Monorepo Structure

```
taskflow/
├── apps/
│   ├── backend/          # Express.js REST API and WebSocket server
│   └── frontend/          # Next.js 16 application with React 19
├── packages/
│   └── Taskflow-Rag/     # Shared RAG and token estimation package
├── package.json          # Root workspace configuration
├── turbo.json            # Turbo build configuration
└── README.md             # This file
```

## 🛠️ Tech Stack

### Frontend (`apps/frontend`)
- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS 4 with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand, React Query
- **Real-Time**: Socket.io Client
- **Rich Text Editor**: BlockNote
- **Animations**: Motion (Framer Motion)
- **Authentication**: Clerk

### Backend (`apps/backend`)
- **Runtime**: Node.js with Express.js 5
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis (ioredis)
- **Real-Time**: Socket.io Server
- **Job Queue**: BullMQ
- **AI SDK**: Vercel AI SDK with streaming support
- **Authentication**: Clerk Express middleware

### Shared Packages
- **@taskflow/rag**: TypeScript package for token estimation and context management in RAG workflows

### Build System
- **Turbo**: High-performance build system for JavaScript and TypeScript monorepos
- **npm Workspaces**: Package management and linking

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >=20.9.0
- **npm**: 10.8.2+ (specified in `packageManager`)
- **PostgreSQL**: Database with pgvector extension
- **Redis**: For caching and job queues
- **Clerk Account**: For authentication
- **AI API Keys**: OpenAI, Google Gemini, or OpenRouter

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will install dependencies for all workspaces using npm workspaces.

3. **Set up environment variables**

   **Backend** (`apps/backend/.env`):
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

   # Supabase (optional)
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Frontend** (`apps/frontend/.env.local`):
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

4. **Set up the database**

   Ensure PostgreSQL has the `pgvector` extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

   Run database migrations:
   ```bash
   npm run db:push --workspace=@taskflow/backend
   ```

   Or use Drizzle Studio:
   ```bash
   npm run db:studio --workspace=@taskflow/backend
   ```

5. **Start Redis**

   Make sure Redis is running locally or update `REDIS_URL` to point to your Redis instance.

6. **Start development servers**

   Start all apps:
   ```bash
   npm run dev
   ```

   Or start individually:
   ```bash
   # Frontend only
   npm run dev:frontend

   # Backend only
   npm run dev:backend
   ```

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001](http://localhost:3001)

## 📜 Available Scripts

### Root Level Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run dev:frontend` | Start only the frontend app |
| `npm run dev:backend` | Start only the backend app |
| `npm run build` | Build all apps and packages |
| `npm run build:frontend` | Build only the frontend app |
| `npm run build:backend` | Build only the backend app |
| `npm run start:backend` | Start the backend in production mode |
| `npm run lint` | Run linting across all workspaces |
| `npm run test` | Run tests across all workspaces |

### Backend Scripts (`apps/backend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Generate migration files |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run docker` | Build and run with Docker Compose |

### Frontend Scripts (`apps/frontend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server with Turbopack |
| `npm run build` | Build Next.js application |
| `npm run start` | Start Next.js production server |
| `npm run lint` | Run ESLint |

### Package Scripts (`packages/Taskflow-Rag`)

| Script | Description |
|--------|-------------|
| `npm run build` | Build TypeScript package |
| `npm run clean` | Remove build artifacts |

## 📦 Workspaces

### Apps

- **@taskflow/backend**: Express.js REST API and WebSocket server
  - RESTful API endpoints for tasks, notes, projects, conversations
  - Real-time communication via Socket.io
  - AI integration with streaming responses
  - Background job processing with BullMQ
  - Vector search capabilities

- **@taskflow/frontend**: Next.js application
  - Task management with Kanban board
  - Rich note-taking with BlockNote
  - AI-powered assistant interface
  - Real-time updates via WebSocket
  - Project workspaces and organization

### Packages

- **@taskflow/rag**: Shared TypeScript package
  - Token estimation utilities
  - Context window management
  - Conversation summarization helpers
  - RAG pipeline support

## 🏛️ Architecture

### Monorepo Benefits

- **Shared Code**: Common utilities and types shared across apps
- **Atomic Changes**: Update frontend and backend together
- **Consistent Tooling**: Unified linting, formatting, and build processes
- **Faster Development**: Turbo caching speeds up builds
- **Type Safety**: Shared TypeScript types between frontend and backend

### Application Architecture

**Frontend**: Clean architecture with separation of concerns
- Presentation layer (React components)
- Application layer (custom hooks)
- Domain layer (business logic)
- Infrastructure layer (API clients, WebSocket)

**Backend**: Layered architecture
- Controllers (request handlers)
- Services (business logic)
- Database operations (Drizzle ORM)
- Middleware (authentication, CORS)

## 🔧 Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** in the relevant workspace(s)

3. **Test locally**
   ```bash
   npm run dev
   ```

4. **Build to verify**
   ```bash
   npm run build
   ```

5. **Commit and push**

### Working with Packages

The `@taskflow/rag` package is automatically linked via npm workspaces. To use it:

```typescript
import { estimateTokens } from "@taskflow/rag";
```

After making changes to the package, rebuild it:
```bash
npm run build --workspace=@taskflow/rag
```

### Database Migrations

When making schema changes to the backend:

```bash
# Generate migration files
npm run db:generate --workspace=@taskflow/backend

# Push changes directly (development)
npm run db:push --workspace=@taskflow/backend

# Or use Drizzle Studio
npm run db:studio --workspace=@taskflow/backend
```

## 🐳 Docker Support

The backend includes Docker Compose support:

```bash
cd apps/backend
npm run docker
```

Or use Docker Compose directly:
```bash
cd apps/backend
docker compose up --build
```

## 📚 Documentation

- [Backend API Documentation](./apps/backend/README.md)
- [Frontend Documentation](./apps/frontend/README.md)
- [RAG Package Documentation](./packages/Taskflow-Rag/README.md)

## 🔒 Security

- Clerk authentication on all API endpoints
- User-scoped data access
- CORS configuration
- Input validation via Zod schemas
- SQL injection prevention via Drizzle ORM

## 🧪 Testing

Run tests across all workspaces:
```bash
npm run test
```

## 📝 License

This project is private and proprietary.

## 👤 Author

Howard Thomas

## 🤝 Contributing

This is a private monorepo. For questions or issues, please contact the maintainer.

