/**
 * Deterministic JSON stringify that sorts object keys
 * Used for generating consistent checksums regardless of key order
 */
export function stableStringify(obj: any): string {
  if (obj === null || obj === undefined) {
    return JSON.stringify(obj);
  }

  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => {
    return JSON.stringify(key) + ':' + stableStringify(obj[key]);
  });

  return '{' + pairs.join(',') + '}';
}
