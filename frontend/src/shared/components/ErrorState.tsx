import { Button } from "../ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="text-lg text-gray-900 dark:text-white">{message}</div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
