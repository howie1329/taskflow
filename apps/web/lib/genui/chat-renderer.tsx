"use client"

import type { Spec } from "@json-render/core"
import type { Components } from "@json-render/react"
import { defineRegistry, JSONUIProvider, Renderer } from "@json-render/react"
import { shadcnComponents } from "@json-render/shadcn"
import { chatGenUICatalog } from "./chat-catalog"

const shadcnChatComponents = {
  Card: shadcnComponents.Card,
  Stack: shadcnComponents.Stack,
  Grid: shadcnComponents.Grid,
  Separator: shadcnComponents.Separator,
  Tabs: shadcnComponents.Tabs,
  Accordion: shadcnComponents.Accordion,
  Collapsible: shadcnComponents.Collapsible,
  Heading: shadcnComponents.Heading,
  Text: shadcnComponents.Text,
  Badge: shadcnComponents.Badge,
  Alert: shadcnComponents.Alert,
  Table: shadcnComponents.Table,
  Progress: shadcnComponents.Progress,
  Skeleton: shadcnComponents.Skeleton,
  Spinner: shadcnComponents.Spinner,
  Image: shadcnComponents.Image,
  Avatar: shadcnComponents.Avatar,
  Link: shadcnComponents.Link,
}

const { registry } = defineRegistry(chatGenUICatalog, {
  components: shadcnChatComponents as unknown as Components<typeof chatGenUICatalog>,
})

interface ChatGenUIRendererProps {
  spec: Spec | null
  state?: Record<string, unknown>
}

export function ChatGenUIRenderer({
  spec,
  state,
}: ChatGenUIRendererProps) {
  return (
    <JSONUIProvider registry={registry} initialState={state}>
      <Renderer spec={spec} registry={registry} />
    </JSONUIProvider>
  )
}
