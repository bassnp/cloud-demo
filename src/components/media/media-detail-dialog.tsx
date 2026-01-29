/**
 * Media Detail Dialog Component
 *
 * Popup dialog for viewing and editing image details.
 * Includes caption editing, visibility toggle, and delete.
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Trash2, Globe, Lock, Calendar, HardDrive } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { SerializedImage, MediaUpdatePayload } from '@/types';

/**
 * Media detail dialog props
 */
interface MediaDetailDialogProps {
  /** Image to display (null if dialog should be closed) */
  image: SerializedImage | null;
  /** Dialog open state */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback to save changes */
  onSave: (payload: MediaUpdatePayload) => Promise<boolean>;
  /** Callback to delete image */
  onDelete: () => Promise<boolean>;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Whether delete is in progress */
  isDeleting?: boolean;
}

/**
 * Media Detail Dialog Component
 *
 * Full-featured dialog for image management:
 * - Large image preview
 * - Editable caption
 * - Visibility toggle (public/private)
 * - Metadata display (dimensions, size, date)
 * - Delete with confirmation
 */
export function MediaDetailDialog({
  image,
  open,
  onOpenChange,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: MediaDetailDialogProps) {
  const [caption, setCaption] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state when image changes
  useEffect(() => {
    if (image) {
      setCaption(image.caption || '');
      setIsPublic(image.isPublic);
      setHasChanges(false);
    }
  }, [image]);

  // Track changes
  useEffect(() => {
    if (image) {
      const captionChanged = caption !== (image.caption || '');
      const visibilityChanged = isPublic !== image.isPublic;
      setHasChanges(captionChanged || visibilityChanged);
    }
  }, [caption, isPublic, image]);

  /**
   * Handle save button click
   */
  const handleSave = async () => {
    const payload: MediaUpdatePayload = {};

    if (caption !== (image?.caption || '')) {
      payload.caption = caption;
    }
    if (isPublic !== image?.isPublic) {
      payload.isPublic = isPublic;
    }

    const success = await onSave(payload);
    if (success) {
      setHasChanges(false);
      onOpenChange(false);
    }
  };

  /**
   * Handle delete confirmation
   */
  const handleDelete = async () => {
    await onDelete();
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Image Details</DialogTitle>
          <DialogDescription>
            View and edit your image settings
          </DialogDescription>
        </DialogHeader>

        {/* Image Preview */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={image.url}
            alt={image.caption || 'Image preview'}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 640px"
            priority
          />
        </div>

        {/* Caption Input */}
        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Input
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            disabled={isSaving}
          />
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            {isPublic ? (
              <Globe className="h-5 w-5 text-lime-moss-600 dark:text-lime-moss-400" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <Label htmlFor="visibility" className="text-base font-medium">
                {isPublic ? 'Public' : 'Private'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isPublic
                  ? 'Anyone can view this image in the public gallery'
                  : 'Only you can see this image'}
              </p>
            </div>
          </div>
          <Switch
            id="visibility"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={isSaving}
          />
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Uploaded: {formatDate(image.uploadedAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <HardDrive className="h-4 w-4" />
            <span>Size: {formatFileSize(image.size)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <span>
              Dimensions: {image.width} × {image.height} px
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          {/* Delete Button with Confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Image</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this image? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
