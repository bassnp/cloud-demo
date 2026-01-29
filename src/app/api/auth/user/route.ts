/**
 * User Session API Route
 *
 * Provides an endpoint for client components to fetch
 * the current session user data.
 */

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/actions';

/**
 * GET /api/auth/user
 *
 * Returns the current session user or null if not authenticated.
 * Used by AuthProvider to refresh user data.
 */
export async function GET(): Promise<NextResponse> {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}
