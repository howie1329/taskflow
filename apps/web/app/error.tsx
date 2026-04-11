"use client"

import type { ComponentProps } from "react"
import AppRouteError from "@/components/route-ui/app-route-error"

export default function Error(props: ComponentProps<typeof AppRouteError>) {
  return (
    <AppRouteError {...props} homeHref="/" homeLabel="Back to home" />
  )
}
