/**
 * User Media Dialog Component
 *
 * Dialog for admin to view and manage any user's media.
 * Allows viewing, editing, and deleting user images.
 */

'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import Image from 'next/image';
import {
  Loader2,
  Trash2,
  Globe,
  Lock,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { AdminMediaDetailDialog } from './admin-media-detail-dialog';
import { getUserImages, adminDeleteImage } from '@/lib/admin/actions';
import { useToast } from '@/hooks/use-toast';
import type { SerializedImage } from '@/types';
import type { UserWithStats } from '@/lib/admin/actions';

/**
 * Props for UserMediaDialog component
 */
interface UserMediaDialogProps {
  /** User whose media to display */
  user: UserWithStats;
  /** Whether dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * User Media Dialog Component
 *
 * Displays a grid of a user's images with actions to:
 * - View image details
 * - Edit caption/visibility
 * - Delete images
 */
export function UserMediaDialog({
  user,
  open,
  onOpenChange,
}: UserMediaDialogProps) {
  const [images, setImages] = useState<SerializedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SerializedImage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  /**
   * Fetch user's images from server
   */
  const loadImages = useCallback(async () => {
    setLoading(true);
    const result = await getUserImages(user.uid);
    if (result.success && result.data) {
      setImages(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to load images',
      });
    }
    setLoading(false);
  }, [user.uid, toast]);

  /**
   * Load images when dialog opens
   */
  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open, loadImages]);

  /**
   * Handle deleting an image
   */
  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    startTransition(async () => {
      const result = await adminDeleteImage(user.uid, imageId);
      if (result.success) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        toast({
          title: 'Image Deleted',
          description: 'The image has been permanently removed.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to delete image',
        });
      }
      setDeletingId(null);
    });
  };

  /**
   * Handle image update from detail dialog
   */
  const handleImageUpdated = (updatedImage: SerializedImage) => {
    setImages((prev) =>
      prev.map((img) => (img.id === updatedImage.id ? updatedImage : img))
    );
    setSelectedImage(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {user.displayName}&apos;s Media
            </DialogTitle>
            <DialogDescription>
              {images.length} {images.length === 1 ? 'image' : 'images'} •
              Click an image to edit details
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No images</h3>
              <p className="text-sm text-muted-foreground">
                This user hasn&apos;t uploaded any images yet.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                  >
                    {/* Image */}
                    <Image
                      src={image.url}
                      alt={image.caption || 'User image'}
                      fill
                      className="object-cover cursor-pointer transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      onClick={() => setSelectedImage(image)}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

                    {/* Visibility Badge */}
                    <Badge
                      variant={image.isPublic ? 'default' : 'secondary'}
                      className="absolute top-2 left-2 text-xs"
                    >
                      {image.isPublic ? (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </>
                      )}
                    </Badge>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            disabled={deletingId === image.id || isPending}
                          >
                            {deletingId === image.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this image?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(image.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Caption */}
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white truncate">
                          {image.caption}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog for editing */}
      <AdminMediaDetailDialog
        image={selectedImage}
        userId={user.uid}
        open={!!selectedImage}
        onOpenChange={(isOpen: boolean) => !isOpen && setSelectedImage(null)}
        onSave={handleImageUpdated}
      />
    </>
  );
}
