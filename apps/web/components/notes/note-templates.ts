import type { ComponentProps } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  FolderManagementIcon,
  NoteIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons"
import { markdownToLexicalState } from "@/lib/notes/lexical-markdown"

export type NoteType =
  | "blank"
  | "meeting"
  | "research"
  | "project_brief"
  | "decision_log"
  | "daily_note"
  | "idea"

type TemplateIcon = ComponentProps<typeof HugeiconsIcon>["icon"]

export type NoteTemplate = {
  key: NoteType
  label: string
  description: string
  noteType: NoteType
  category: "quick" | "structured"
  icon: TemplateIcon
  defaultTitle: string
  defaultContent: string
  defaultContentText: string
}

function createTemplate({
  key,
  label,
  description,
  icon,
  category,
  defaultTitle,
  markdown,
}: {
  key: NoteType
  label: string
  description: string
  icon: TemplateIcon
  category: "quick" | "structured"
  defaultTitle: string
  markdown: string
}): NoteTemplate {
  const state = markdownToLexicalState(markdown)

  return {
    key,
    label,
    description,
    noteType: key,
    category,
    icon,
    defaultTitle,
    defaultContent: state.lexicalJson,
    defaultContentText: state.plainText,
  }
}

const templateList = [
  createTemplate({
    key: "blank",
    label: "Blank",
    description: "Start with an empty page and shape it however you want.",
    category: "quick",
    icon: NoteIcon,
    defaultTitle: "",
    markdown: "",
  }),
  createTemplate({
    key: "meeting",
    label: "Meeting",
    description: "Capture agenda, discussion notes, decisions, and next steps.",
    category: "quick",
    icon: ArrowRight01Icon,
    defaultTitle: "Meeting notes",
    markdown: `## Agenda

- 

## Notes

- 

## Decisions

- 

## Action items

- [ ] `,
  }),
  createTemplate({
    key: "research",
    label: "Research",
    description: "Collect findings, sources, open questions, and takeaways.",
    category: "structured",
    icon: SearchIcon,
    defaultTitle: "Research notes",
    markdown: `## Question


## Findings

- 

## Sources

- 

## Open questions

- `,
  }),
  createTemplate({
    key: "project_brief",
    label: "Project brief",
    description: "Outline goals, scope, milestones, risks, and success criteria.",
    category: "structured",
    icon: FolderManagementIcon,
    defaultTitle: "Project brief",
    markdown: `## Goal


## Scope

- In
- Out

## Milestones

- 

## Risks

- 

## Success criteria

- `,
  }),
  createTemplate({
    key: "decision_log",
    label: "Decision log",
    description: "Record a decision, the context, tradeoffs, and follow-up.",
    category: "structured",
    icon: CheckmarkCircle02Icon,
    defaultTitle: "Decision log",
    markdown: `## Decision


## Context


## Options considered

- 

## Tradeoffs

- 

## Follow-up

- `,
  }),
  createTemplate({
    key: "daily_note",
    label: "Daily note",
    description: "Track focus, wins, blockers, and notes from the day.",
    category: "structured",
    icon: NoteIcon,
    defaultTitle: "Daily note",
    markdown: `## Focus

- 

## Notes

- 

## Wins

- 

## Blockers

- 

## Tomorrow

- `,
  }),
  createTemplate({
    key: "idea",
    label: "Idea",
    description: "Jot down a concept, why it matters, and what to test next.",
    category: "quick",
    icon: Add01Icon,
    defaultTitle: "New idea",
    markdown: `## Idea


## Why it matters


## What could make it work

- 

## Next experiment

- `,
  }),
] as const satisfies readonly NoteTemplate[]

export function getAllTemplates() {
  return templateList
}

export function getTemplateByKey(key?: string | null) {
  if (!key) return templateList[0]
  return templateList.find((template) => template.key === key) ?? templateList[0]
}

export function getTemplateByNoteType(noteType?: string | null) {
  if (!noteType) return templateList[0]
  return templateList.find((template) => template.noteType === noteType) ?? templateList[0]
}
