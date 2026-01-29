/**
 * Admin Media Detail Dialog Component
 *
 * Dialog for admin to edit any user's image details.
 * Similar to MediaDetailDialog but uses admin actions.
 */

'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { Loader2, Globe, Lock, Calendar, HardDrive } from 'lucide-react';
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
import { adminUpdateImage } from '@/lib/admin/actions';
import { useToast } from '@/hooks/use-toast';
import type { SerializedImage } from '@/types';

/**
 * Props for AdminMediaDetailDialog component
 */
interface AdminMediaDetailDialogProps {
  /** Image to display (null if dialog should be closed) */
  image: SerializedImage | null;
  /** Owner's user ID */
  userId: string;
  /** Dialog open state */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when image is saved */
  onSave: (updatedImage: SerializedImage) => void;
}

/**
 * Admin Media Detail Dialog Component
 *
 * Allows admin to edit any user's image:
 * - Caption
 * - Visibility (public/private)
 */
export function AdminMediaDetailDialog({
  image,
  userId,
  open,
  onOpenChange,
  onSave,
}: AdminMediaDetailDialogProps) {
  const [caption, setCaption] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

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
  const handleSave = () => {
    if (!image) return;

    startTransition(async () => {
      const updates: { caption?: string; isPublic?: boolean } = {};

      if (caption !== (image.caption || '')) {
        updates.caption = caption;
      }
      if (isPublic !== image.isPublic) {
        updates.isPublic = isPublic;
      }

      const result = await adminUpdateImage(userId, image.id, updates);

      if (result.success) {
        toast({
          title: 'Image Updated',
          description: 'The image details have been saved.',
        });
        onSave({
          ...image,
          caption: updates.caption ?? image.caption,
          isPublic: updates.isPublic ?? image.isPublic,
        });
        setHasChanges(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to update image',
        });
      }
    });
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Image Details</DialogTitle>
          <DialogDescription>
            Modify this image&apos;s caption and visibility
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
          <Label htmlFor="admin-caption">Caption</Label>
          <Input
            id="admin-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            disabled={isPending}
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
              <Label htmlFor="admin-visibility" className="text-base font-medium">
                {isPublic ? 'Public' : 'Private'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isPublic
                  ? 'Anyone can view this image in the public gallery'
                  : 'Only the owner can see this image'}
              </p>
            </div>
          </div>
          <Switch
            id="admin-visibility"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={isPending}
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

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isPending}
            className="min-w-[120px]"
          >
            {isPending ? (
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
