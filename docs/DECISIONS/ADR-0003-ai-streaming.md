# ADR-0003: AI Delivery Mode

Date: 2026-01-31
Status: Accepted

## Decision

v1 AI chat uses non-streaming responses by default.

## Why

- Faster to build and more reliable while core workplace features are being implemented.
- Streaming can be added later with a dedicated Next.js route.
