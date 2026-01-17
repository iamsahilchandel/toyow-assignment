// Log severity levels
export type LogLevel = "debug" | "info" | "warn" | "error";

// Log entry structure
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  stepId: string;
  stepName: string;
  message: string;
  metadata?: Record<string, unknown>;
  duration?: number;
  input?: unknown;
  output?: unknown;
  error?: {
    message: string;
    stack?: string;
  };
}

// Log filter options
export interface LogFilters {
  stepId?: string;
  level?: LogLevel;
  searchTerm?: string;
}
