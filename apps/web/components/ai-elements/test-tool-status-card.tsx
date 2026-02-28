import { ExternalLink } from "lucide-react"

type Source = {
  title?: string
  url?: string
  snippet?: string
}

type Task = {
  id?: string
  title?: string
  status?: string
}

type TestToolOutput = {
  status?: string
  message?: string
  query?: string
  summary?: string
  total?: number
  sources?: Source[]
  tasks?: Task[]
}

interface TestToolStatusCardProps {
  output: unknown
}

export function TestToolStatusCard({ output }: TestToolStatusCardProps) {
  const data = (output ?? {}) as TestToolOutput

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
      {data.message && (
        <p className="text-sm font-medium text-foreground">{data.message}</p>
      )}

      {data.query && (
        <p className="text-xs text-muted-foreground">
          Query: <span className="font-medium text-foreground">{data.query}</span>
        </p>
      )}

      {typeof data.total === "number" && (
        <p className="text-xs text-muted-foreground">Total tasks in DB: {data.total}</p>
      )}

      {data.summary && (
        <p className="line-clamp-4 text-xs text-muted-foreground">{data.summary}</p>
      )}

      {Array.isArray(data.sources) && data.sources.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">
            Sources ({data.sources.length})
          </p>
          <ul className="space-y-1.5">
            {data.sources.slice(0, 5).map((source, index) => (
              <li key={`${source.url ?? source.title ?? "source"}-${index}`}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {source.title ?? source.url ?? "Source"}
                  <ExternalLink className="size-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(data.tasks) && data.tasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Tasks ({data.tasks.length})</p>
          <ul className="space-y-1">
            {data.tasks.slice(0, 8).map((task, index) => (
              <li
                key={`${task.id ?? task.title ?? "task"}-${index}`}
                className="text-xs text-muted-foreground"
              >
                <span className="font-medium text-foreground">{task.title ?? "Untitled"}</span>
                {task.status ? ` · ${task.status}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
