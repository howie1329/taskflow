import { defineCatalog } from "@json-render/core"
import { schema } from "@json-render/react/schema"
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog"

const chatComponentDefinitions = {
  Card: shadcnComponentDefinitions.Card,
  Stack: shadcnComponentDefinitions.Stack,
  Grid: shadcnComponentDefinitions.Grid,
  Separator: shadcnComponentDefinitions.Separator,
  Tabs: shadcnComponentDefinitions.Tabs,
  Accordion: shadcnComponentDefinitions.Accordion,
  Collapsible: shadcnComponentDefinitions.Collapsible,
  Heading: shadcnComponentDefinitions.Heading,
  Text: shadcnComponentDefinitions.Text,
  Badge: shadcnComponentDefinitions.Badge,
  Alert: shadcnComponentDefinitions.Alert,
  Table: shadcnComponentDefinitions.Table,
  Progress: shadcnComponentDefinitions.Progress,
  Skeleton: shadcnComponentDefinitions.Skeleton,
  Spinner: shadcnComponentDefinitions.Spinner,
  Image: shadcnComponentDefinitions.Image,
  Avatar: shadcnComponentDefinitions.Avatar,
  Link: shadcnComponentDefinitions.Link,
} as const

export const chatGenUICatalog = defineCatalog(schema, {
  components: chatComponentDefinitions,
  actions: {},
})

export type ChatGenUIComponentName = keyof typeof chatComponentDefinitions
