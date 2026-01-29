/**
 * Avatar Upload Component
 *
 * Allows users to upload a new profile photo.
 * Handles client-side upload to Firebase Storage.
 * Features enhanced avatar preview with ring styling and hover lift effect.
 */

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, User } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { updateProfilePhoto } from '@/lib/settings/actions';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UPLOAD_CONFIG } from '@/lib/constants';
import imageCompression from 'browser-image-compression';

interface AvatarUploadProps {
  /** Current profile photo URL */
  currentPhotoURL: string | null;
  /** Display name for fallback initials */
  displayName: string;
}

/**
 * Generate initials from a display name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Avatar upload component with preview and Firebase Storage integration
 */
export function AvatarUpload({ currentPhotoURL, displayName }: AvatarUploadProps) {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initials = getInitials(displayName || 'User');

  /**
   * Handle file selection and upload
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Wait for Firebase Auth to initialize before allowing uploads
    if (loading) {
      setError('Please wait for authentication to initialize...');
      return;
    }

    // Ensure Firebase Auth is authenticated for Storage operations
    if (!firebaseUser) {
      setError('Firebase authentication required. Please log out and log in again.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      setError(`File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Force token refresh to ensure auth is current for Storage operations
      await firebaseUser.getIdToken(true);

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Compress image before upload
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5, // Avatar should be small
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });

      // Upload to Firebase Storage using firebaseUser.uid (matches storage.rules: users/{userId}/avatar/{filename})
      const storageRef = ref(storage, `users/${firebaseUser.uid}/avatar/${Date.now()}.jpg`);
      await uploadBytes(storageRef, compressedFile, {
        contentType: compressedFile.type,
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update profile in Firestore via server action
      const result = await updateProfilePhoto(downloadURL);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile photo');
      }

      // Refresh the page to show new avatar
      router.refresh();
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Trigger file input click
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Avatar preview with ring styling and hover effect */}
      <div className={cn(
        "relative group cursor-pointer",
        "transition-transform duration-200",
        "hover:-translate-y-1"
      )}
        onClick={handleButtonClick}
      >
        <Avatar className={cn(
          "h-24 w-24",
          "ring-4 ring-pacific-blue-600/20 dark:ring-lime-moss-500/20",
          "transition-all duration-200",
          "group-hover:ring-pacific-blue-600/40 group-hover:shadow-lg",
          "dark:group-hover:ring-lime-moss-500/40"
        )}>
          <AvatarImage src={previewUrl || currentPhotoURL || undefined} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-pacific-blue-100 to-pacific-blue-50 dark:from-lime-moss-900/50 dark:to-lime-moss-950 text-pacific-blue-700 dark:text-lime-moss-400">
            {initials || <User className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>

        {/* Camera overlay on hover */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full",
          "bg-black/0 group-hover:bg-black/30",
          "transition-all duration-200",
          isUploading ? "bg-black/50" : ""
        )}>
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          )}
        </div>
      </div>

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={isUploading}
        className={cn(
          "transition-all duration-200",
          "hover:border-pacific-blue-600/50 hover:shadow-sm",
          "dark:hover:border-lime-moss-500/50"
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Change Photo
          </>
        )}
      </Button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-tangerine-600 dark:text-tangerine-400 text-center animate-fade-in">
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG, GIF or WebP. Max {UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB.
      </p>
    </div>
  );
}
