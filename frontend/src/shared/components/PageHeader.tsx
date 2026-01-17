import { type ReactNode } from "react";
import { cn } from "../lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex justify-between items-center", className)}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {description}
          </p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
