/**
 * Upload Validation Schemas
 * 
 * Zod schemas for validating file uploads.
 */

import { z } from 'zod';
import { UPLOAD_CONFIG } from '@/lib/constants';

/**
 * File type validation
 * 
 * Validates that the file MIME type is an allowed image type.
 */
export const fileTypeSchema = z.enum(
  UPLOAD_CONFIG.ALLOWED_TYPES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `File must be one of: ${UPLOAD_CONFIG.ALLOWED_TYPES.join(', ')}`,
    }),
  }
);

/**
 * File size validation
 * 
 * Validates that the file size is within the allowed limit.
 */
export const fileSizeSchema = z
  .number()
  .max(
    UPLOAD_CONFIG.MAX_FILE_SIZE,
    `File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB`
  );

/**
 * Image metadata validation schema
 */
export const imageMetadataSchema = z.object({
  title: z
    .string()
    .max(100, 'Title must be less than 100 characters')
    .optional()
    .nullable(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  isPublic: z.boolean().default(false),
});

/**
 * Complete upload validation schema
 * 
 * Validates the file object and metadata together.
 */
export const uploadSchema = z.object({
  file: z.object({
    name: z.string().min(1, 'Filename is required'),
    type: fileTypeSchema,
    size: fileSizeSchema,
  }),
  metadata: imageMetadataSchema,
});

/**
 * Update image metadata schema
 */
export const updateImageSchema = z.object({
  title: z
    .string()
    .max(100, 'Title must be less than 100 characters')
    .optional()
    .nullable(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  isPublic: z.boolean().optional(),
});

/**
 * Inferred types from schemas
 */
export type ImageMetadata = z.infer<typeof imageMetadataSchema>;
export type UploadData = z.infer<typeof uploadSchema>;
export type UpdateImageData = z.infer<typeof updateImageSchema>;
