/**
 * Danger Zone Component
 *
 * Account deletion with confirmation dialog.
 * Requires typing "DELETE" to confirm account deletion.
 * Features tangerine-tinted styling for visual emphasis.
 */

'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { requestAccountDeletion } from '@/lib/settings/actions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

/**
 * Danger zone section for account deletion
 */
export function DangerZone() {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Check if confirmation text matches "DELETE"
   */
  const isConfirmValid = confirmText.toUpperCase() === 'DELETE';

  /**
   * Handle account deletion
   */
  const handleDelete = async () => {
    if (!isConfirmValid) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await requestAccountDeletion();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete account');
      }

      // The server action will redirect to login after deletion
    } catch (err) {
      console.error('Account deletion failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  /**
   * Reset dialog state when closed
   */
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmText('');
      setError(null);
    }
  };

  return (
    <Card className={cn(
      "border-tangerine-500/50",
      "bg-gradient-to-br from-tangerine-50/50 to-transparent",
      "dark:from-tangerine-950/20 dark:to-transparent"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            "bg-tangerine-100 dark:bg-tangerine-900/50"
          )}>
            <AlertTriangle className="h-5 w-5 text-tangerine-600 dark:text-tangerine-400" />
          </div>
          <div>
            <CardTitle className="text-tangerine-700 dark:text-tangerine-300">
              Danger Zone
            </CardTitle>
            <CardDescription className="text-tangerine-600/70 dark:text-tangerine-400/70">
              Irreversible and destructive actions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={cn(
          "rounded-lg border p-4",
          "border-tangerine-300/50 dark:border-tangerine-700/50",
          "bg-tangerine-50/50 dark:bg-tangerine-950/30"
        )}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-medium text-tangerine-800 dark:text-tangerine-200">
                Delete Account
              </p>
              <p className="text-sm text-tangerine-600/80 dark:text-tangerine-400/80">
                Permanently delete your account and all associated data.
                This action cannot be undone.
              </p>
            </div>

            <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-tangerine-500 to-tangerine-600",
                    "hover:from-tangerine-400 hover:to-tangerine-500",
                    "shadow-lg shadow-tangerine-500/25",
                    "transition-all duration-200"
                  )}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="animate-scale-in">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-tangerine-700 dark:text-tangerine-300">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Account
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="text-sm text-muted-foreground space-y-4">
                      <p>
                        This action is <strong className="text-tangerine-600 dark:text-tangerine-400">permanent and irreversible</strong>.
                        All your data will be deleted, including:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Your profile information</li>
                        <li>All uploaded images</li>
                        <li>Your account credentials</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2 py-4">
                  <Label htmlFor="confirm-delete" className="text-sm font-medium">
                    Type <strong className="text-tangerine-600 dark:text-tangerine-400">DELETE</strong> to confirm
                  </Label>
                  <Input
                    id="confirm-delete"
                    placeholder="DELETE"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    disabled={isDeleting}
                    error={!!error}
                    className="font-mono"
                  />
                  {error && (
                    <p className="text-sm text-tangerine-600 dark:text-tangerine-400 animate-fade-in">
                      {error}
                    </p>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={!isConfirmValid || isDeleting}
                    className={cn(
                      "bg-gradient-to-r from-tangerine-500 to-tangerine-600",
                      "hover:from-tangerine-400 hover:to-tangerine-500",
                      "text-white",
                      "shadow-lg shadow-tangerine-500/25"
                    )}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
