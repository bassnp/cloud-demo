/**
 * Settings Page
 *
 * User profile and account settings.
 * Includes profile editing, avatar upload, password management, and account deletion.
 */

import { getSessionUser } from '@/lib/auth/actions';
import { getUserProfile } from '@/lib/settings/actions';
import { PageHeader } from '@/components/layout/page-header';
import { ProfileForm } from '@/components/settings/profile-form';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { PasswordResetButton } from '@/components/settings/password-reset-button';
import { DangerZone } from '@/components/settings/danger-zone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Mail, Chrome, ImageIcon } from 'lucide-react';

/**
 * Settings Page Component
 *
 * Displays user profile information and account management options.
 */
export default async function SettingsPage() {
  const currentUser = await getSessionUser();

  // This should never happen due to layout protection
  if (!currentUser) {
    return null;
  }

  // Get extended profile information
  const profile = await getUserProfile(currentUser.uid);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Settings"
        description="Manage your profile and account"
        icon={<Settings className="h-5 w-5" />}
      />

      {/* Profile Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile details and photo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row md:gap-12">
            {/* Avatar Upload */}
            <div className="flex-shrink-0">
              <AvatarUpload
                currentPhotoURL={profile.photoURL}
                displayName={profile.displayName || 'User'}
              />
            </div>

            {/* Profile Form */}
            <ProfileForm
              displayName={profile.displayName || ''}
              email={profile.email}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Account Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total Images</p>
              <p className="text-2xl font-bold">{profile.imageCount}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Public Images</p>
              <p className="text-2xl font-bold">{profile.publicImageCount}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-lg font-semibold">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Security
          </CardTitle>
          <CardDescription>
            Manage your authentication methods and password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Linked Accounts */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Linked Accounts</p>
            <div className="flex flex-wrap gap-2">
              {profile.hasPassword && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email & Password
                </Badge>
              )}
              {profile.hasGoogle && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Chrome className="h-3 w-3" />
                  Google
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Password Reset */}
          {profile.hasPassword && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Send a password reset email to change your password
              </p>
              <PasswordResetButton email={profile.email} />
            </div>
          )}

          {!profile.hasPassword && profile.hasGoogle && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                You signed up with Google. Password management is handled by your Google account.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Badge (if applicable) */}
      {currentUser.isAdmin && (
        <Card className="border-primary/50">
          <CardContent className="flex items-center gap-3 py-4">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Administrator Account</p>
              <p className="text-sm text-muted-foreground">
                You have full administrative access to the platform
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <DangerZone />
    </div>
  );
}
