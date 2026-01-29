/**
 * Image Utilities
 *
 * Client-side utilities for image processing before upload.
 * Includes compression, dimension extraction, and path generation.
 */

import imageCompression from 'browser-image-compression';
import { UPLOAD_CONFIG } from '@/lib/constants';

/**
 * Compression options for browser-image-compression
 */
const compressionOptions = {
  maxSizeMB: UPLOAD_CONFIG.MAX_FILE_SIZE_MB,
  maxWidthOrHeight: UPLOAD_CONFIG.MAX_DIMENSION,
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
  initialQuality: UPLOAD_CONFIG.COMPRESSION_QUALITY,
};

/**
 * Compress an image file before upload
 *
 * Uses browser-image-compression to reduce file size while
 * maintaining acceptable quality.
 *
 * @param file - Original image file
 * @returns Compressed image file
 */
export async function compressImage(file: File): Promise<File> {
  try {
    // Skip compression for already small files
    if (file.size < UPLOAD_CONFIG.MAX_FILE_SIZE / 2) {
      return file;
    }

    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Image dimensions result
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Extract image dimensions from a file
 *
 * Creates an in-memory image to read natural width and height.
 *
 * @param file - Image file to measure
 * @returns Promise resolving to dimensions
 */
export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for dimension extraction'));
    };

    img.src = url;
  });
}

/**
 * Generate a unique storage path for an uploaded image
 *
 * Creates a path structure: users/{uid}/images/{timestamp}-{randomId}.{ext}
 *
 * @param uid - User's Firebase UID
 * @param filename - Original filename
 * @returns Storage path string
 */
export function generateStoragePath(uid: string, filename: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const sanitizedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)
    ? extension
    : 'jpg';

  return `users/${uid}/images/${timestamp}-${randomId}.${sanitizedExt}`;
}

/**
 * Validate that a file is an allowed image type
 *
 * @param file - File to validate
 * @returns True if file type is allowed
 */
export function isValidImageType(file: File): boolean {
  return (UPLOAD_CONFIG.ALLOWED_TYPES as readonly string[]).includes(file.type);
}

/**
 * Validate that a file is within size limits
 *
 * @param file - File to validate
 * @returns True if file size is within limits
 */
export function isValidImageSize(file: File): boolean {
  return file.size <= UPLOAD_CONFIG.MAX_FILE_SIZE;
}

/**
 * Get a human-readable error for invalid files
 *
 * @param file - File that failed validation
 * @returns Error message string
 */
export function getImageValidationError(file: File): string | null {
  if (!isValidImageType(file)) {
    return `Invalid file type. Allowed: ${UPLOAD_CONFIG.ALLOWED_TYPES.join(', ')}`;
  }
  if (!isValidImageSize(file)) {
    return `File too large. Maximum size: ${UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB`;
  }
  return null;
}
