import crypto from 'crypto';

/**
 * Generate SHA-256 hash of input data
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate SHA-256 hash of an object using stable stringify
 */
export function sha256Object(obj: Record<string, any>): string {
  const { stableStringify } = require('./stableStringify');
  return sha256(stableStringify(obj));
}
