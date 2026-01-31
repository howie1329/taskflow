# ADR-0002: Schedule Model

Date: 2026-01-31
Status: Accepted

## Decision

v1 schedule is "assign tasks to a day" using `tasks.scheduledDate` (YYYY-MM-DD string).

## Why

- It matches the current product need (plan upcoming days) without introducing time-block complexity.
- It keeps the data model and UI simple for v1.

## Follow-ups

- v1.1 can add time-of-day and duration via a `scheduleBlocks` table if needed.
