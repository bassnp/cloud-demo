/**
 * Input Sanitization Utilities
 *
 * Functions for sanitizing user input to prevent XSS and other attacks.
 * These should be used on all user-provided strings before storage.
 */

/**
 * HTML entities that need to be escaped for XSS prevention
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

/**
 * Sanitize user input to prevent XSS attacks
 *
 * Escapes HTML entities and removes control characters.
 *
 * @param input - Raw user input
 * @returns Sanitized string safe for display
 *
 * @example
 * const safe = sanitizeInput('<script>alert("xss")</script>');
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove other control characters (except newline, tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Escape HTML entities
    .replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] || char)
    // Trim whitespace
    .trim();
}

/**
 * Sanitize input but preserve newlines for multi-line text
 *
 * @param input - Raw user input
 * @returns Sanitized string with preserved newlines
 */
export function sanitizeMultilineInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Escape HTML entities
    .replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] || char)
    // Trim whitespace
    .trim();
}

/**
 * Sanitize file name for safe storage
 *
 * Removes path traversal attempts and unsafe characters.
 *
 * @param filename - Original filename
 * @returns Sanitized filename safe for storage
 *
 * @example
 * const safe = sanitizeFileName('../../../etc/passwd');
 * // Returns: 'etc-passwd'
 */
export function sanitizeFileName(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed';
  }

  return (
    filename
      // Remove path separators and traversal attempts
      .replace(/[/\\]/g, '-')
      .replace(/\.\./g, '')
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Replace problematic characters
      .replace(/[<>:"|?*]/g, '-')
      // Remove leading/trailing dots and spaces
      .replace(/^[\s.]+|[\s.]+$/g, '')
      // Collapse multiple dashes
      .replace(/-+/g, '-')
      // Limit length
      .slice(0, 255) || 'unnamed'
  );
}

/**
 * Validate URL is from allowed domains
 *
 * @param url - URL to validate
 * @returns True if URL is from an allowed domain
 */
export function isAllowedImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);

    // List of allowed domains for images
    const allowedDomains = [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'lh3.googleusercontent.com', // Google profile photos
    ];

    // Check exact match or subdomain of allowed domains
    const isAllowed = allowedDomains.some(
      (domain) =>
        parsed.hostname === domain ||
        parsed.hostname.endsWith(`.${domain}`)
    );

    // Also allow *.firebasestorage.app domains
    if (parsed.hostname.endsWith('.firebasestorage.app')) {
      return true;
    }

    return isAllowed;
  } catch {
    return false;
  }
}

/**
 * Sanitize email address
 *
 * @param email - Raw email input
 * @returns Lowercased, trimmed email
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email.toLowerCase().trim();
}

/**
 * Strip all HTML tags from input
 *
 * @param input - Input that may contain HTML
 * @returns Plain text without HTML tags
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Truncate string to maximum length with ellipsis
 *
 * @param input - String to truncate
 * @param maxLength - Maximum length (default 100)
 * @returns Truncated string
 */
export function truncate(input: string, maxLength = 100): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength - 3)}...`;
}
