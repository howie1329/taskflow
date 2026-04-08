import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <div
      className="flex h-full flex-col rounded-md border border-border/50 bg-transparent p-4"
      aria-hidden="true"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <Skeleton className="size-2.5 rounded-full" />
        <Skeleton className="size-5 rounded-sm" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

interface ProjectGridSkeletonProps {
  count?: number;
}

export function ProjectGridSkeleton({ count = 6 }: ProjectGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      role="status"
      aria-label="Loading projects..."
    >
      {[...Array(count)].map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
