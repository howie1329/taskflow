import { HugeiconsIcon } from "@hugeicons/react"
import { NotificationIcon } from "@hugeicons/core-free-icons"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function NotificationsPage() {
  return (
    <div className="flex h-full flex-col">
      <Empty className="min-h-[320px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={NotificationIcon} className="size-4" />
          </EmptyMedia>
          <EmptyTitle>No notifications yet</EmptyTitle>
          <EmptyDescription>
            We will surface task updates and mentions here as they arrive.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
