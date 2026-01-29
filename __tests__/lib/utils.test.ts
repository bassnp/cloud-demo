/**
 * Utility Function Tests
 * 
 * Unit tests for utility functions in src/lib/utils.ts
 */

import { describe, it, expect } from 'vitest';
import { cn, generateId, formatDate, formatFileSize, truncateText } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('resolves Tailwind conflicts by keeping last value', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8');
  });

  it('handles conditional classes correctly', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
  });

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'extra')).toBe('base extra');
  });

  it('handles empty strings', () => {
    expect(cn('base', '', 'extra')).toBe('base extra');
  });

  it('handles object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('handles array syntax', () => {
    expect(cn(['one', 'two'], 'three')).toBe('one two three');
  });

  it('resolves complex Tailwind conflicts', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

describe('generateId', () => {
  it('produces unique IDs on each call', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('includes timestamp as prefix', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+-/);
  });

  it('has correct format with timestamp and random suffix', () => {
    const id = generateId();
    const parts = id.split('-');
    expect(parts.length).toBe(2);
    expect(Number(parts[0])).toBeGreaterThan(0);
    expect(parts[1].length).toBe(7);
  });

  it('generates many unique IDs without collision', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(1000);
  });
});

describe('formatDate', () => {
  it('formats Date object correctly', () => {
    // Use a date with explicit time to avoid timezone edge cases
    const date = new Date(2024, 0, 15, 12, 0, 0); // Jan 15, 2024 12:00:00 local time
    const result = formatDate(date);
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('formats ISO string correctly', () => {
    // Use mid-day UTC to avoid date shifts
    const result = formatDate('2024-06-20T12:00:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('2024');
  });

  it('formats timestamp number correctly', () => {
    // Use local timezone date constructor to avoid edge cases
    const date = new Date(2024, 11, 25, 12, 0, 0); // Dec 25, 2024 12:00:00 local time
    const result = formatDate(date.getTime());
    expect(result).toContain('Dec');
    expect(result).toContain('25');
    expect(result).toContain('2024');
  });
});

describe('formatFileSize', () => {
  it('formats 0 bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('formats bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
  });

  it('formats gigabytes correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });
});

describe('truncateText', () => {
  it('does not truncate text shorter than maxLength', () => {
    expect(truncateText('short', 10)).toBe('short');
  });

  it('does not truncate text equal to maxLength', () => {
    expect(truncateText('exactly10!', 10)).toBe('exactly10!');
  });

  it('truncates text longer than maxLength with ellipsis', () => {
    const result = truncateText('this is a very long text', 10);
    expect(result).toBe('this is...');
    expect(result.length).toBe(10);
  });

  it('handles edge case of very short maxLength', () => {
    expect(truncateText('hello', 4)).toBe('h...');
  });
});
