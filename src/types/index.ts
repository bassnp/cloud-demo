/**
 * TypeScript Type Definitions
 * 
 * Centralized type definitions for the application.
 * All interfaces and types should be defined here.
 */

import type { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User document stored in Firestore
 * Path: /users/{uid}
 */
export interface User {
  /** Firebase Auth UID */
  uid: string;
  /** User's email address */
  email: string;
  /** User's display name */
  displayName: string | null;
  /** URL to user's profile photo */
  photoURL: string | null;
  /** Whether the user is banned from the platform */
  isBanned: boolean;
  /** Timestamp when the user was created */
  createdAt: Timestamp;
  /** Timestamp when the user was last updated */
  updatedAt: Timestamp;
}

/**
 * User profile stored in Firestore /users/{uid}
 * Alias for User interface for Phase 1 compatibility
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: Timestamp;
}

/**
 * Serialized user profile for Client Components
 * Timestamps converted to ISO strings for JSON serialization
 */
export interface SerializedUserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: string;
}

// ============================================================================
// IMAGE TYPES
// ============================================================================

/**
 * Image document stored in Firestore
 * Path: /users/{uid}/images/{imageId}
 */
export interface Image {
  /** Unique image ID (Firestore document ID) */
  id: string;
  /** Owner's user ID */
  userId: string;
  /** Original filename */
  filename: string;
  /** Public download URL from Firebase Storage */
  url: string;
  /** Firebase Storage path */
  storagePath: string;
  /** MIME type (e.g., 'image/jpeg') */
  contentType: string;
  /** File size in bytes */
  size: number;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** User-provided title/caption */
  title: string | null;
  /** User-provided description */
  description: string | null;
  /** Whether the image is publicly visible */
  isPublic: boolean;
  /** Timestamp when the image was uploaded */
  createdAt: Timestamp;
  /** Timestamp when the image was last updated */
  updatedAt: Timestamp;
}

/**
 * Image document (alias for compatibility with Phase 1 guide)
 * Simplified version used in Phase 3 for media grid display
 */
export interface ImageDocument {
  /** Unique image ID */
  id: string;
  /** Public download URL */
  url: string;
  /** Firebase Storage path */
  storagePath: string;
  /** User-provided caption */
  caption: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** File size in bytes */
  size: number;
  /** MIME type (e.g., 'image/jpeg') */
  contentType: string;
  /** Whether the image is publicly visible */
  isPublic: boolean;
  /** Timestamp when the image was uploaded */
  uploadedAt: Timestamp;
}

/**
 * Serialized image for Client Components
 * Timestamps converted to ISO strings for JSON serialization
 */
export interface SerializedImage {
  /** Unique image ID */
  id: string;
  /** Public download URL */
  url: string;
  /** Firebase Storage path */
  storagePath: string;
  /** User-provided caption */
  caption: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** File size in bytes */
  size: number;
  /** MIME type (e.g., 'image/jpeg') */
  contentType: string;
  /** Whether the image is publicly visible */
  isPublic: boolean;
  /** Timestamp when the image was uploaded (ISO string) */
  uploadedAt: string;
}

/**
 * Public image with owner information
 * Used for the public gallery view
 */
export interface PublicImageWithOwner extends SerializedImage {
  /** Owner's display information */
  owner: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
}

/**
 * Payload for updating media (caption and/or visibility)
 */
export interface MediaUpdatePayload {
  /** Updated caption (optional) */
  caption?: string;
  /** Updated visibility (optional) */
  isPublic?: boolean;
}

/**
 * Image metadata for saving after upload
 */
export interface ImageMetadata {
  /** Original filename */
  filename: string;
  /** Public download URL */
  url: string;
  /** Firebase Storage path */
  storagePath: string;
  /** MIME type */
  contentType: string;
  /** File size in bytes */
  size: number;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

/**
 * Session user data (from verified session cookie)
 * This is a subset of Firebase Auth user data
 */
export interface SessionUser {
  /** Firebase Auth UID */
  uid: string;
  /** User's email address */
  email: string | undefined;
  /** User's display name */
  displayName: string | undefined;
  /** URL to user's profile photo */
  photoURL: string | undefined;
  /** Whether the user is an admin (based on email check) */
  isAdmin: boolean;
}

/**
 * Custom claims structure for Firebase Auth tokens
 */
export interface CustomClaims {
  role?: 'user' | 'admin';
  admin?: boolean;
}

/**
 * Authentication state for client-side context
 */
export interface AuthState {
  /** Current user (null if not logged in) */
  user: SessionUser | null;
  /** Whether auth state is being loaded */
  isLoading: boolean;
  /** Authentication error (if any) */
  error: string | null;
}

/**
 * Form validation result
 */
export interface ValidationResult<T> {
  /** Whether validation passed */
  success: boolean;
  /** Validated data (if success) */
  data?: T;
  /** Validation errors (if failed) */
  errors?: Record<string, string[]>;
}

/**
 * Server action response
 */
export interface ActionResponse<T = void> {
  /** Whether the action was successful */
  success: boolean;
  /** Response data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Total number of items */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Upload progress state
 */
export interface UploadProgress {
  /** Upload state */
  state: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  /** Progress percentage (0-100) */
  progress: number;
  /** Error message (if state is 'error') */
  error?: string;
}

/**
 * Admin statistics
 */
export interface AdminStats {
  /** Total number of users */
  totalUsers: number;
  /** Number of active users (not banned) */
  activeUsers: number;
  /** Number of banned users */
  bannedUsers: number;
  /** Total number of images */
  totalImages: number;
  /** Number of public images */
  publicImages: number;
  /** Total storage used in bytes */
  totalStorageBytes: number;
}

// ============================================================================
// FAVORITES TYPES
// ============================================================================

/**
 * Favorite document stored in Firestore
 * Path: /users/{uid}/favorites/{imageId}
 */
export interface FavoriteDocument {
  imageId: string;
  ownerId: string;
  favoritedAt: Timestamp;
}
