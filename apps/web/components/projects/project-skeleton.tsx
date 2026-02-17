import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-border/60 bg-card/40 dark:bg-card/20 p-4 h-full flex flex-col space-y-2"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-sm" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex justify-between items-center pt-3 mt-auto border-t border-border/30">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-14 rounded-sm" />
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
      role="status"
      aria-label="Loading projects..."
    >
      {[...Array(count)].map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
