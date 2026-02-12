import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface MessageDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messageText: string
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4))
}

function getMessageLengthLabel(text: string) {
  const wordCount = text.trim().length ? text.trim().split(/\s+/).length : 0
  return `${wordCount} words · ${text.length} chars`
}

export function MessageDetailsSheet({
  open,
  onOpenChange,
  messageText,
}: MessageDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Assistant message details</SheetTitle>
          <SheetDescription>
            Token and size metrics for this response.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-3 py-4">
          <div className="rounded-md border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Estimated tokens</p>
            <p className="text-lg font-semibold">{estimateTokens(messageText)}</p>
          </div>
          <div className="rounded-md border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Length</p>
            <p className="text-sm font-medium">{getMessageLengthLabel(messageText)}</p>
          </div>
          <div className="rounded-md border border-border/60 p-3">
            <p className="text-xs text-muted-foreground">Preview</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {messageText || "No text in this message."}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
