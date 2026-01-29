/**
 * Authentication Context Provider
 *
 * Provides authentication state to client components.
 * Combines server-side session data with client-side Firebase Auth state.
 */

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import type { SessionUser } from '@/types';

/**
 * Auth Context Type Definition
 */
interface AuthContextType {
  /** Server-verified session user (null if not authenticated) */
  user: SessionUser | null;
  /** Client-side Firebase user (for real-time auth state) */
  firebaseUser: FirebaseUser | null;
  /** Loading state during auth initialization */
  loading: boolean;
  /** Refresh user data from server */
  refreshUser: () => Promise<void>;
}

/**
 * Auth Context
 *
 * Initialized to null - must be used within AuthProvider.
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
  /** Initial user from server-side session */
  initialUser: SessionUser | null;
}

/**
 * Authentication Provider Component
 *
 * Wraps the application to provide authentication state.
 * Initializes with server-side session data and syncs with client-side Firebase Auth.
 *
 * @param children - Child components
 * @param initialUser - Server-side session user (passed from layout)
 */
export function AuthProvider({
  children,
  initialUser,
}: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Subscribe to Firebase Auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Refresh user data from server
   *
   * Fetches the latest session user data from the API.
   * Useful after profile updates or session changes.
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 *
 * Must be used within an AuthProvider component.
 * Throws an error if used outside of provider.
 *
 * @returns AuthContextType with user, firebaseUser, loading, and refreshUser
 *
 * @example
 * const { user, loading } = useAuth();
 * if (loading) return <Spinner />;
 * if (!user) return <LoginPrompt />;
 * return <Dashboard user={user} />;
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
