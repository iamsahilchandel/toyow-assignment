import { Skeleton } from "../ui/skeleton";

interface LoadingStateProps {
  message?: string;
  skeletonCount?: number;
}

export function LoadingState({
  message = "Loading...",
  skeletonCount = 3,
}: LoadingStateProps) {
  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="text-lg text-gray-600 dark:text-gray-400">{message}</div>
      <div className="space-y-2">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
