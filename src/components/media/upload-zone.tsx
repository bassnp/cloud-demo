/**
 * Upload Zone Component
 *
 * Premium drag-and-drop area for uploading images.
 * Features gradient backgrounds, animated drag states, and progress styling.
 */

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, ImagePlus, CheckCircle } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import {
  compressImage,
  getImageDimensions,
  generateStoragePath,
  getImageValidationError,
} from '@/lib/images';
import { saveImageMetadata } from '@/lib/upload/actions';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UPLOAD_CONFIG } from '@/lib/constants';

/**
 * Upload file state
 */
interface UploadFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'complete' | 'error';
  error?: string;
}

/**
 * Upload Zone Component
 *
 * Premium features:
 * - Gradient background with rounded corners
 * - Animated drag state with scale and glow
 * - Gradient progress bar with shimmer effect
 * - Staggered file card animations
 */
export function UploadZone() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  /**
   * Update file status in state
   */
  const updateFileStatus = useCallback(
    (
      id: string,
      status: UploadFile['status'],
      progress: number,
      error?: string
    ) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status, progress, error } : f))
      );
    },
    []
  );

  /**
   * Process a single file upload
   */
  const processUpload = useCallback(
    async (uploadFile: UploadFile, uid: string) => {
      try {
        // Update status to compressing
        updateFileStatus(uploadFile.id, 'compressing', 5);

        // Compress the image
        const compressedFile = await compressImage(uploadFile.file);
        updateFileStatus(uploadFile.id, 'compressing', 20);

        // Get image dimensions
        const dimensions = await getImageDimensions(compressedFile);
        updateFileStatus(uploadFile.id, 'uploading', 25);

        // Generate storage path
        const storagePath = generateStoragePath(uid, uploadFile.file.name);

        // Upload to Firebase Storage
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile, {
          contentType: compressedFile.type,
        });

        // Track upload progress
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress =
                25 + (snapshot.bytesTransferred / snapshot.totalBytes) * 65;
              updateFileStatus(uploadFile.id, 'uploading', Math.round(progress));
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                // Get download URL
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                updateFileStatus(uploadFile.id, 'uploading', 95);

                // Save metadata to Firestore
                const result = await saveImageMetadata({
                  filename: uploadFile.file.name,
                  url: downloadURL,
                  storagePath,
                  contentType: compressedFile.type,
                  size: compressedFile.size,
                  width: dimensions.width,
                  height: dimensions.height,
                });

                if (result.success) {
                  updateFileStatus(uploadFile.id, 'complete', 100);
                  // Refresh the page to show new image
                  router.refresh();
                } else {
                  throw new Error(result.error || 'Failed to save metadata');
                }

                resolve();
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } catch (error) {
        console.error('Upload failed:', error);
        updateFileStatus(
          uploadFile.id,
          'error',
          0,
          error instanceof Error ? error.message : 'Upload failed'
        );
      }
    },
    [updateFileStatus, router]
  );

  /**
   * Handle file drop
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Clear any previous auth errors
      setAuthError(null);

      // Wait for Firebase Auth to initialize
      if (loading) {
        setAuthError('Please wait for authentication to initialize...');
        return;
      }

      // Require both session user and Firebase Auth for uploads
      if (!user || !firebaseUser) {
        setAuthError('Firebase authentication required. Please log out and log in again.');
        console.error('Upload requires authentication. firebaseUser:', !!firebaseUser, 'user:', !!user);
        return;
      }

      // Force token refresh to ensure auth is current for Storage operations
      try {
        await firebaseUser.getIdToken(true);
      } catch (tokenError) {
        console.error('Failed to refresh auth token:', tokenError);
        setAuthError('Authentication expired. Please log out and log in again.');
        return;
      }

      // Create upload file entries
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'pending' as const,
      }));

      // Validate files and mark invalid ones
      const validatedFiles = newFiles.map((uploadFile) => {
        const error = getImageValidationError(uploadFile.file);
        if (error) {
          return { ...uploadFile, status: 'error' as const, error };
        }
        return uploadFile;
      });

      setFiles((prev) => [...prev, ...validatedFiles]);

      // Process valid files using Firebase Auth uid
      for (const uploadFile of validatedFiles) {
        if (uploadFile.status === 'error') continue;
        await processUpload(uploadFile, firebaseUser.uid);
      }
    },
    [user, firebaseUser, loading, processUpload]
  );

  /**
   * Remove a file from the list
   */
  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  /**
   * Clear all completed/errored files
   */
  const clearCompleted = () => {
    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.preview && (f.status === 'complete' || f.status === 'error')) {
          URL.revokeObjectURL(f.preview);
        }
      });
      return prev.filter(
        (f) => f.status !== 'complete' && f.status !== 'error'
      );
    });
  };

  /**
   * Setup dropzone
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    },
    maxSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    disabled: !user,
  });

  const hasCompletedOrErrored = files.some(
    (f) => f.status === 'complete' || f.status === 'error'
  );

  return (
    <div className="space-y-4">
      {/* Auth Error Message */}
      {authError && (
        <div className={cn(
          "p-3 rounded-lg",
          "bg-tangerine-50 dark:bg-tangerine-950/30",
          "border-l-4 border-tangerine-500",
          "text-sm text-tangerine-700 dark:text-tangerine-300",
          "animate-fade-in"
        )}>
          {authError}
        </div>
      )}

      {/* Dropzone - Premium Styling */}
      <div
        {...getRootProps()}
        className={cn(
          // Base dropzone styling
          'border-2 border-dashed rounded-2xl cursor-pointer group',
          // Gradient background
          'bg-gradient-to-br from-muted/30 to-muted/10',
          // Hover state - Theme-aware
          'hover:border-pacific-blue-400 hover:bg-pacific-blue-50/50',
          'dark:hover:border-lime-moss-400 dark:hover:bg-lime-moss-900/20',
          // Smooth transition
          'transition-all duration-300 ease-out',
          // Active drag state - Theme-aware
          isDragActive && [
            'border-pacific-blue-500 bg-pacific-blue-100/50',
            'dark:border-lime-moss-500 dark:bg-lime-moss-900/30',
            'scale-[1.02]',
            'shadow-glow shadow-pacific-blue-500/30 dark:shadow-lime-moss-500/30',
          ],
          // Default border
          !isDragActive && 'border-muted-foreground/25'
        )}
      >
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <input {...getInputProps()} />
          
          {/* Upload Icon with Hover Effects */}
          <div
            className={cn(
              'rounded-full p-4 mb-4',
              'bg-gradient-to-br from-pacific-blue-100 to-muted',
              'dark:from-lime-moss-900/50 dark:to-muted',
              'group-hover:scale-110',
              'transition-transform duration-300 ease-out'
            )}
          >
            <ImagePlus
              className={cn(
                'h-10 w-10',
                'text-muted-foreground',
                'group-hover:text-pacific-blue-500 dark:group-hover:text-lime-moss-400',
                'transition-colors duration-300'
              )}
            />
          </div>
          
          {isDragActive ? (
            <p className="text-pacific-blue-600 dark:text-lime-moss-400 font-semibold text-lg">
              Drop images here...
            </p>
          ) : (
            <>
              <p className="text-center font-semibold text-lg mb-1">
                Drag & drop images here
              </p>
              <p className="text-sm text-muted-foreground text-center">
                or click to browse • Max {UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB per file
              </p>
            </>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Uploads ({files.length})</h3>
            {hasCompletedOrErrored && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                className="text-xs hover:text-pacific-blue-500 dark:hover:text-lime-moss-400"
              >
                Clear completed
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <Card
                key={file.id}
                className={cn(
                  'overflow-hidden',
                  // Staggered fade-in animation
                  'animate-fade-up opacity-0',
                  // Enhanced hover state
                  'hover:shadow-md transition-shadow duration-200'
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Preview */}
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={file.preview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {file.status === 'compressing' && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Compressing...
                          </span>
                        )}
                        {file.status === 'uploading' && (
                          <span className="text-xs text-pacific-blue-600 dark:text-lime-moss-400 flex items-center gap-1">
                            <Upload className="h-3 w-3" />
                            Uploading...
                          </span>
                        )}
                        {file.status === 'complete' && (
                          <span className="text-xs text-lime-moss-600 dark:text-lime-moss-400 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Complete
                          </span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-xs text-destructive truncate">
                            {file.error}
                          </span>
                        )}
                      </div>

                      {/* Premium Gradient Progress Bar - Theme-aware */}
                      {(file.status === 'compressing' ||
                        file.status === 'uploading') && (
                        <div className="w-full h-2 bg-pacific-blue-100 dark:bg-lime-moss-950 rounded-full overflow-hidden mt-2">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              // Gradient from Pacific Blue to Lime Moss (light) / Lime Moss gradient (dark)
                              'bg-gradient-to-r from-pacific-blue-500 to-lime-moss-500',
                              'dark:from-lime-moss-600 dark:to-lime-moss-400',
                              // Shimmer animation overlay
                              'relative overflow-hidden',
                              // Smooth width transition
                              'transition-all duration-300 ease-out'
                            )}
                            style={{ width: `${file.progress}%` }}
                          >
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
