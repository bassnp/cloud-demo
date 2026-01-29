/**
 * Sanitization Utility Tests
 *
 * Tests for input sanitization functions to prevent XSS attacks.
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  sanitizeMultilineInput,
  sanitizeFileName,
  isAllowedImageUrl,
  sanitizeEmail,
  stripHtml,
  truncate,
} from '@/lib/sanitize';

describe('sanitizeInput', () => {
  it('should return empty string for null/undefined', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null as unknown as string)).toBe('');
    expect(sanitizeInput(undefined as unknown as string)).toBe('');
  });

  it('should escape HTML entities', () => {
    expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
    expect(sanitizeInput('a & b')).toBe('a &amp; b');
    expect(sanitizeInput('"quoted"')).toBe('&quot;quoted&quot;');
    expect(sanitizeInput("it's")).toBe('it&#x27;s');
  });

  it('should escape XSS attack vectors', () => {
    const xss = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(xss);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
  });

  it('should remove null bytes', () => {
    expect(sanitizeInput('hello\0world')).toBe('helloworld');
  });

  it('should remove control characters', () => {
    expect(sanitizeInput('hello\x08world')).toBe('helloworld');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
});

describe('sanitizeMultilineInput', () => {
  it('should preserve newlines', () => {
    expect(sanitizeMultilineInput('line1\nline2')).toBe('line1\nline2');
  });

  it('should normalize line endings', () => {
    expect(sanitizeMultilineInput('line1\r\nline2')).toBe('line1\nline2');
    expect(sanitizeMultilineInput('line1\rline2')).toBe('line1\nline2');
  });

  it('should escape HTML in multiline text', () => {
    const input = '<div>\nContent\n</div>';
    const result = sanitizeMultilineInput(input);
    expect(result).toContain('&lt;div&gt;');
    expect(result).toContain('\n');
  });
});

describe('sanitizeFileName', () => {
  it('should return "unnamed" for empty input', () => {
    expect(sanitizeFileName('')).toBe('unnamed');
    expect(sanitizeFileName(null as unknown as string)).toBe('unnamed');
  });

  it('should remove path separators', () => {
    expect(sanitizeFileName('path/to/file.jpg')).toBe('path-to-file.jpg');
    expect(sanitizeFileName('path\\to\\file.jpg')).toBe('path-to-file.jpg');
  });

  it('should prevent path traversal', () => {
    // Path traversal is neutralized - leading dashes are acceptable
    const result1 = sanitizeFileName('../../../etc/passwd');
    expect(result1).not.toContain('..');
    expect(result1).toContain('etc');
    expect(result1).toContain('passwd');

    const result2 = sanitizeFileName('..\\..\\windows\\system32');
    expect(result2).not.toContain('..');
    expect(result2).toContain('windows');
    expect(result2).toContain('system32');
  });

  it('should remove problematic characters', () => {
    expect(sanitizeFileName('file<name>.jpg')).toBe('file-name-.jpg');
    expect(sanitizeFileName('file:name.jpg')).toBe('file-name.jpg');
  });

  it('should collapse multiple dashes', () => {
    expect(sanitizeFileName('file---name.jpg')).toBe('file-name.jpg');
  });

  it('should limit length to 255 characters', () => {
    const longName = 'a'.repeat(300) + '.jpg';
    expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255);
  });
});

describe('isAllowedImageUrl', () => {
  it('should allow Firebase Storage URLs', () => {
    expect(
      isAllowedImageUrl(
        'https://firebasestorage.googleapis.com/v0/b/bucket/o/image.jpg'
      )
    ).toBe(true);
  });

  it('should allow firebasestorage.app domains', () => {
    expect(
      isAllowedImageUrl('https://project.firebasestorage.app/image.jpg')
    ).toBe(true);
  });

  it('should allow Google user content URLs', () => {
    expect(
      isAllowedImageUrl('https://lh3.googleusercontent.com/photo.jpg')
    ).toBe(true);
  });

  it('should reject unknown domains', () => {
    expect(isAllowedImageUrl('https://evil.com/malware.jpg')).toBe(false);
    expect(isAllowedImageUrl('https://example.com/image.jpg')).toBe(false);
  });

  it('should reject invalid URLs', () => {
    expect(isAllowedImageUrl('not-a-url')).toBe(false);
    expect(isAllowedImageUrl('')).toBe(false);
  });

  it('should reject null/undefined', () => {
    expect(isAllowedImageUrl(null as unknown as string)).toBe(false);
    expect(isAllowedImageUrl(undefined as unknown as string)).toBe(false);
  });
});

describe('sanitizeEmail', () => {
  it('should lowercase email', () => {
    expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com');
  });

  it('should trim whitespace', () => {
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
  });

  it('should return empty string for invalid input', () => {
    expect(sanitizeEmail('')).toBe('');
    expect(sanitizeEmail(null as unknown as string)).toBe('');
  });
});

describe('stripHtml', () => {
  it('should remove HTML tags', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
    expect(stripHtml('<div><span>Content</span></div>')).toBe('Content');
  });

  it('should handle nested tags', () => {
    expect(stripHtml('<div><p><strong>Bold</strong></p></div>')).toBe('Bold');
  });

  it('should replace nbsp with space', () => {
    expect(stripHtml('Hello&nbsp;World')).toBe('Hello World');
  });

  it('should handle empty/null input', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml(null as unknown as string)).toBe('');
  });
});

describe('truncate', () => {
  it('should not truncate short strings', () => {
    expect(truncate('Hello', 100)).toBe('Hello');
  });

  it('should truncate long strings with ellipsis', () => {
    const result = truncate('This is a very long string', 10);
    expect(result).toBe('This is...');
    expect(result.length).toBe(10);
  });

  it('should use default maxLength of 100', () => {
    const longString = 'a'.repeat(150);
    const result = truncate(longString);
    expect(result.length).toBe(100);
    expect(result.endsWith('...')).toBe(true);
  });

  it('should handle empty/null input', () => {
    expect(truncate('')).toBe('');
    expect(truncate(null as unknown as string)).toBe('');
  });
});
