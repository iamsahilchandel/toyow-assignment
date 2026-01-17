// Log severity levels (UPPERCASE to match backend)
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

// Log entry structure matching backend API
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  stepId: string;
  message: string;
  metadata?: Record<string, unknown>;
}

// Log filter options
export interface LogFilters {
  stepId?: string;
  level?: LogLevel;
  searchTerm?: string;
}
