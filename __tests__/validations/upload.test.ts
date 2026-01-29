/**
 * Upload Validation Schema Tests
 * 
 * Unit tests for file upload validation schemas.
 */

import { describe, it, expect } from 'vitest';
import { imageMetadataSchema } from '@/lib/validations/upload';

describe('imageMetadataSchema', () => {
  it('validates valid metadata with all fields', () => {
    const result = imageMetadataSchema.safeParse({
      title: 'My Photo',
      description: 'A beautiful sunset',
      isPublic: true,
    });
    expect(result.success).toBe(true);
  });

  it('validates metadata with optional fields omitted', () => {
    const result = imageMetadataSchema.safeParse({
      isPublic: false,
    });
    expect(result.success).toBe(true);
  });

  it('validates metadata with null optional fields', () => {
    const result = imageMetadataSchema.safeParse({
      title: null,
      description: null,
      isPublic: true,
    });
    expect(result.success).toBe(true);
  });

  it('defaults isPublic to false', () => {
    const result = imageMetadataSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublic).toBe(false);
    }
  });

  it('rejects title longer than 100 characters', () => {
    const result = imageMetadataSchema.safeParse({
      title: 'A'.repeat(101),
      isPublic: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title');
    }
  });

  it('rejects description longer than 500 characters', () => {
    const result = imageMetadataSchema.safeParse({
      description: 'A'.repeat(501),
      isPublic: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('description');
    }
  });
});
