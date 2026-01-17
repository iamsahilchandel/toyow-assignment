/**
 * Date formatting utilities using date-fns.
 * Provides consistent date display across the app.
 */

import {
  format,
  formatDistanceToNow,
  formatDuration,
  intervalToDuration,
} from "date-fns";

/**
 * Format a date for display in list views (e.g., "Jan 17, 2026")
 */
export function formatDate(date: Date | string | number): string {
  return format(new Date(date), "PPP");
}

/**
 * Format a date with time (e.g., "Jan 17, 2026 at 3:30 PM")
 */
export function formatDateTime(date: Date | string | number): string {
  return format(new Date(date), "PPp");
}

/**
 * Format a date with full time including seconds (e.g., "Jan 17, 2026 at 3:30:45 PM")
 */
export function formatDateTimeFull(date: Date | string | number): string {
  return format(new Date(date), "PPpp");
}

/**
 * Format as relative time (e.g., "5 minutes ago", "in 3 days")
 */
export function formatRelativeTime(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Format duration in milliseconds to human readable (e.g., "1m 30s")
 */
export function formatDurationMs(ms: number): string {
  const duration = intervalToDuration({ start: 0, end: ms });

  // Format based on duration length
  if (duration.hours && duration.hours > 0) {
    return formatDuration(duration, {
      format: ["hours", "minutes", "seconds"],
    });
  }
  if (duration.minutes && duration.minutes > 0) {
    return formatDuration(duration, { format: ["minutes", "seconds"] });
  }

  // For short durations, show seconds with milliseconds
  const seconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;

  if (seconds > 0) {
    return `${seconds}.${milliseconds.toString().padStart(3, "0").slice(0, 2)}s`;
  }

  return `${ms}ms`;
}

/**
 * Format a timestamp for log entries (e.g., "15:30:45.123")
 */
export function formatLogTimestamp(date: Date | string | number): string {
  return format(new Date(date), "HH:mm:ss.SSS");
}

/**
 * Format a short date (e.g., "Jan 17")
 */
export function formatShortDate(date: Date | string | number): string {
  return format(new Date(date), "MMM d");
}

/**
 * Format time only (e.g., "3:30 PM")
 */
export function formatTime(date: Date | string | number): string {
  return format(new Date(date), "p");
}

/**
 * Check if a date is today.
 */
export function isToday(date: Date | string | number): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Smart format that shows relative time for recent dates, full date for older.
 */
export function formatSmartDate(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Within last 24 hours: show relative
  if (diffHours < 24) {
    return formatRelativeTime(d);
  }

  // Within same year: show without year
  if (d.getFullYear() === now.getFullYear()) {
    return format(d, "MMM d 'at' p");
  }

  // Different year: show full date
  return formatDateTime(d);
}
