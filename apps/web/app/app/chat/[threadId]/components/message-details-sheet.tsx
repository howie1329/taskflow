import type { UIMessage } from "ai"
import {
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  Attachments,
} from "@/components/ai-elements/attachments"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { CopyIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildMessageDetailsViewModel } from "@/lib/chat/right-panel-view-model"
import {
  RightPanelChipRow,
  RightPanelCollapsibleSection,
  RightPanelEmptyState,
  RightPanelList,
  RightPanelListRow,
  RightPanelScrollBody,
  RightPanelSection,
  RightPanelShell,
  RightPanelSummaryBar,
} from "@/components/app/right-panel-primitives"
import {
  getToolDisplayNameFromKey,
  getToolStateInfo,
} from "./tool-meta"

interface MessageDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: UIMessage | null
  onCopy?: (text: string) => void
}

export function MessageDetailsSheet({
  open,
  onOpenChange,
  message,
  onCopy,
}: MessageDetailsSheetProps) {
  const viewModel = buildMessageDetailsViewModel(message)
  const canCopy = !!viewModel && !!onCopy

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full border-l border-border/60 px-4 sm:max-w-md">
        <RightPanelShell className="pt-5">
          <RightPanelScrollBody>
            {!viewModel ? (
              <RightPanelSection title="Message details">
                <RightPanelEmptyState
                  title="No message selected"
                  description="Pick an assistant message to inspect tokens, reasoning, tools, and preview content."
                />
              </RightPanelSection>
            ) : (
              <>
                <RightPanelSummaryBar
                  eyebrow="Summary"
                  title={viewModel.summaryTitle}
                  description={
                    <span className="line-clamp-4">{viewModel.summaryDescription}</span>
                  }
                  actions={
                    canCopy ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCopy?.(viewModel.text)}
                      >
                        <CopyIcon className="size-3.5" />
                        Copy
                      </Button>
                    ) : null
                  }
                />

                <RightPanelChipRow chips={viewModel.chips} />

                <RightPanelSection
                  title="Metrics"
                  description="Usage and size information for this message."
                >
                  <RightPanelList>
                    {viewModel.metrics.map((metric) => (
                      <RightPanelListRow key={metric.label}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-muted-foreground">
                            {metric.label}
                          </span>
                          <span className="font-medium text-foreground">
                            {metric.value}
                          </span>
                        </div>
                      </RightPanelListRow>
                    ))}
                  </RightPanelList>
                </RightPanelSection>

                <RightPanelCollapsibleSection
                  title="Attachments"
                  description="Files attached to this message."
                  defaultOpen={viewModel.attachments.length > 0}
                >
                  {viewModel.attachments.length === 0 ? (
                    <RightPanelEmptyState
                      title="No attachments"
                      description="This message does not include files."
                    />
                  ) : (
                    <div className="rounded-xl border border-border/45 bg-background px-3 py-3">
                      <Attachments variant="list">
                        {viewModel.attachments.map((file, fileIndex) => (
                          <Attachment
                            key={`${message!.id}-${file.filename ?? "file"}-${fileIndex}`}
                            data={{ ...file, id: `${message!.id}-${fileIndex}` }}
                          >
                            <AttachmentPreview />
                            <AttachmentInfo showMediaType />
                            {file.url ? (
                              <Button asChild size="sm" variant="outline">
                                <a href={file.url} target="_blank" rel="noreferrer">
                                  Open
                                </a>
                              </Button>
                            ) : null}
                          </Attachment>
                        ))}
                      </Attachments>
                    </div>
                  )}
                </RightPanelCollapsibleSection>

                <RightPanelCollapsibleSection
                  title="Reasoning"
                  description="Expanded reasoning trace when available."
                  defaultOpen={false}
                >
                  {viewModel.reasoningText?.trim() ? (
                    <div className="rounded-xl border border-border/45 bg-background px-4 py-3">
                      <p
                        className={cn(
                          "whitespace-pre-wrap text-sm leading-6 text-muted-foreground",
                        )}
                      >
                        {viewModel.reasoningText}
                      </p>
                    </div>
                  ) : (
                    <RightPanelEmptyState
                      title="No reasoning captured"
                      description="This message does not have persisted reasoning text."
                    />
                  )}
                </RightPanelCollapsibleSection>

                <RightPanelCollapsibleSection
                  title="Tool Activity"
                  description="Assistant tools invoked while producing this message."
                  defaultOpen={viewModel.toolCalls.length > 0}
                >
                  {viewModel.toolCalls.length === 0 ? (
                    <RightPanelEmptyState
                      title="No tools used"
                      description="The assistant responded without calling tools."
                    />
                  ) : (
                    <RightPanelList>
                      {viewModel.toolCalls.map((tool) => {
                        const stateInfo = getToolStateInfo(tool.state)
                        return (
                          <RightPanelListRow key={tool.id}>
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="text-sm font-medium leading-6 text-foreground">
                                  {getToolDisplayNameFromKey(tool.toolKey)}
                                </div>
                                <RightPanelChipRow
                                  chips={[
                                    stateInfo.badgeLabel.toLowerCase(),
                                    tool.toolKey,
                                  ]}
                                />
                              </div>
                            </div>
                          </RightPanelListRow>
                        )
                      })}
                    </RightPanelList>
                  )}
                </RightPanelCollapsibleSection>

                <RightPanelCollapsibleSection
                  title="Preview"
                  description="Rendered text content for this message."
                  defaultOpen={false}
                >
                  <div className="rounded-xl border border-border/45 bg-background px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                      {viewModel.text || "No text in this message."}
                    </p>
                  </div>
                </RightPanelCollapsibleSection>
              </>
            )}
          </RightPanelScrollBody>
        </RightPanelShell>
      </SheetContent>
    </Sheet>
  )
}
