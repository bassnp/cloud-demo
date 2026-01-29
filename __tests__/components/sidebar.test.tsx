/**
 * Sidebar Component Tests
 *
 * Tests for the sidebar navigation component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { SessionUser } from '@/types';

// Mock next/navigation
const mockPathname = vi.fn(() => '/public');

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock logout action
vi.mock('@/lib/auth/actions', () => ({
  destroySession: vi.fn(() => Promise.resolve()),
}));

// Import component after mocks
import { Sidebar } from '@/components/layout/sidebar';

// Helper to create user objects
function createUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    uid: 'test-uid',
    email: 'user@example.com',
    displayName: 'Test User',
    photoURL: undefined,
    isAdmin: false,
    ...overrides,
  };
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/public');
  });

  it('should render navigation items', () => {
    render(<Sidebar user={createUser()} />);

    // Public link should always be visible
    expect(screen.getByRole('link', { name: /public/i })).toBeInTheDocument();
  });

  it('should render My Media link for authenticated users', () => {
    render(<Sidebar user={createUser()} />);

    expect(screen.getByRole('link', { name: /my media/i })).toBeInTheDocument();
  });

  it('should render Settings link for authenticated users', () => {
    render(<Sidebar user={createUser()} />);

    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('should NOT render Admin link for non-admin users', () => {
    render(<Sidebar user={createUser()} />);

    expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
  });

  it('should render Admin link for admin users', () => {
    const adminUser = createUser({
      uid: 'admin-uid',
      email: 'admin@example.com',
      displayName: 'Admin',
      isAdmin: true,
    });

    render(<Sidebar user={adminUser} />);

    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
  });

  it('should highlight active route', () => {
    mockPathname.mockReturnValue('/media');

    render(<Sidebar user={createUser()} />);

    const mediaLink = screen.getByRole('link', { name: /my media/i });
    // Active links use Pacific Blue gradient background styling
    expect(mediaLink).toHaveClass('bg-gradient-to-r');
    expect(mediaLink).toHaveClass('text-pacific-blue-600');
  });

  it('should display user name', () => {
    render(<Sidebar user={createUser()} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should display user email', () => {
    render(<Sidebar user={createUser()} />);

    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('should render logout button', () => {
    render(<Sidebar user={createUser()} />);

    // Button has "Log out" as accessible name via sr-only
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });
});
