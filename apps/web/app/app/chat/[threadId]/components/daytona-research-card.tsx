import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDownIcon, FileCodeIcon } from "lucide-react"
import { buildDaytonaResearchActivityViewModel } from "@/lib/chat/daytona-research-activity"

type ToolProgressItem = {
  toolKey: string
  toolCallId: string
  status: "running" | "done" | "error"
  text: string
}

function statusDot(status: "running" | "complete" | "error") {
  if (status === "error") return "bg-destructive"
  if (status === "running") return "bg-amber-500 animate-pulse"
  return "bg-emerald-500"
}

export function DaytonaResearchCard({
  output,
  progress,
}: {
  output: unknown
  progress: ToolProgressItem[]
}) {
  const model = buildDaytonaResearchActivityViewModel({ output, progress })
  if (!model) {
    return null
  }

  return (
    <div className="space-y-4">
      {model.summary ? (
        <p className="text-sm leading-6 text-foreground">{model.summary}</p>
      ) : null}

      {model.activity.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Research Activity
          </p>
          <div className="space-y-2">
            {model.activity.map((step) => (
              <div
                key={step.id}
                className="rounded-md border border-border/50 bg-background/60 px-3 py-2"
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1 size-2 rounded-full ${statusDot(step.status)}`} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium leading-5 text-foreground">
                      {step.label}
                    </p>
                    {step.detail ? (
                      <p className="text-sm leading-5 text-muted-foreground">
                        {step.detail}
                      </p>
                    ) : null}
                    {step.meta.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {step.meta.map((item) => (
                          <span
                            key={`${step.id}-${item}`}
                            className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {model.findings.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Findings
          </p>
          <div className="space-y-3">
            {model.findings.map((finding, index) => (
              <div key={`${finding.title}-${index}`} className="space-y-1">
                <p className="text-sm font-medium leading-5 text-foreground">
                  {finding.title}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {finding.detail}
                </p>
                {finding.citations.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {finding.citations.map((citation) => (
                      <span
                        key={`${finding.title}-${citation}`}
                        className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        <FileCodeIcon className="size-3" />
                        {citation}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {model.limitations.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Limitations
          </p>
          {model.limitations.map((item, index) => (
            <p key={`${item}-${index}`} className="text-sm leading-6 text-muted-foreground">
              {item}
            </p>
          ))}
        </div>
      ) : null}

      {model.transcriptText ? (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground">
            Debug Transcript
            <ChevronDownIcon className="size-3.5 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <pre className="max-h-64 overflow-auto rounded-md border border-border/50 bg-background/60 p-3 text-xs leading-5 text-muted-foreground whitespace-pre-wrap break-words">
              {model.transcriptText}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  )
}
