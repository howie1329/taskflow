# Architecture Overview (Rewrite)

## Goal

Ship faster by reducing moving parts.

## Core Building Blocks

- `apps/web`: Next.js app (UI)
- Convex: data + server functions
- Clerk: authentication

## High-Level Data Flow

1. User signs in via Clerk.
2. UI calls Convex queries/mutations.
3. Convex enforces user scoping.
4. Optional: AI action calls LLM provider and persists results.

## Principles

- Single source of truth: Convex.
- User scoping everywhere.
- Start simple (non-streaming AI, string search) and iterate.

Next docs:

- Data model: `docs/ARCHITECTURE/data-model.md`
- Security rules: `docs/ARCHITECTURE/security.md`
- AI architecture: `docs/ARCHITECTURE/ai.md`
