/**
 * NDJSON (Newline Delimited JSON) parsing utilities.
 * Used for streaming log responses from the backend.
 */

export interface NDJSONParseResult<T> {
  data: T;
  raw: string;
}

/**
 * Parse a single NDJSON line into a typed object.
 */
export function parseNDJSONLine<T>(line: string): NDJSONParseResult<T> | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  try {
    const data = JSON.parse(trimmed) as T;
    return { data, raw: trimmed };
  } catch {
    return null;
  }
}

/**
 * Parse multiple NDJSON lines (buffer) into an array of typed objects.
 * Returns the parsed items and any remaining incomplete buffer.
 */
export function parseNDJSONBuffer<T>(buffer: string): {
  items: T[];
  remaining: string;
} {
  const lines = buffer.split("\n");
  const remaining = lines.pop() || ""; // Keep incomplete line in buffer
  const items: T[] = [];

  for (const line of lines) {
    const result = parseNDJSONLine<T>(line);
    if (result) {
      items.push(result.data);
    }
  }

  return { items, remaining };
}

/**
 * Create a streaming NDJSON reader from a Response object.
 * Yields parsed items as they arrive.
 */
export async function* streamNDJSON<T>(
  response: Response,
): AsyncGenerator<T, void, unknown> {
  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const { items, remaining } = parseNDJSONBuffer<T>(buffer);
      buffer = remaining;

      for (const item of items) {
        yield item;
      }
    }

    // Process any remaining data in buffer
    if (buffer.trim()) {
      const result = parseNDJSONLine<T>(buffer);
      if (result) {
        yield result.data;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Helper to create a fetch request for NDJSON streaming.
 */
export async function fetchNDJSONStream<T>(
  url: string,
  options: RequestInit = {},
): Promise<AsyncGenerator<T, void, unknown>> {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return streamNDJSON<T>(response);
}
