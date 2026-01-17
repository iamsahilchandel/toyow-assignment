import { URL } from 'url';

/**
 * SSRF Protection Blocklist
 * Blocks requests to internal/private IP ranges and metadata endpoints
 */

// Private IP ranges (RFC 1918 and others)
const PRIVATE_IP_PATTERNS = [
  // Localhost
  /^127\./,
  /^localhost$/i,
  /^::1$/,
  /^\[::1\]$/,

  // Private Class A (10.0.0.0/8)
  /^10\./,

  // Private Class B (172.16.0.0/12)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,

  // Private Class C (192.168.0.0/16)
  /^192\.168\./,

  // Link-local (169.254.0.0/16)
  /^169\.254\./,

  // Loopback (127.0.0.0/8)
  /^127\./,

  // Cloud metadata endpoints
  /^169\.254\.169\.254$/, // AWS/GCP metadata
  /^metadata\.google\.internal$/i,
  /^metadata$/i,

  // Internal hostnames
  /\.internal$/i,
  /\.local$/i,
  /\.localhost$/i,
];

// Blocked protocols
const BLOCKED_PROTOCOLS = ['file:', 'ftp:', 'gopher:', 'data:', 'javascript:'];

/**
 * Check if a URL is safe to request (not internal/private)
 * @param urlStr - URL string to check
 * @returns boolean - true if safe, false if blocked
 */
export function isSafeUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);

    // Check protocol
    if (BLOCKED_PROTOCOLS.includes(url.protocol)) {
      return false;
    }

    // Only allow http and https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    // Check hostname against blocklist
    const hostname = url.hostname.toLowerCase();

    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return false;
      }
    }

    return true;
  } catch {
    // Invalid URL
    return false;
  }
}

/**
 * Validate URL and throw if blocked
 */
export function validateUrl(urlStr: string): void {
  if (!isSafeUrl(urlStr)) {
    throw new Error(`URL is blocked by SSRF protection: ${urlStr}`);
  }
}
