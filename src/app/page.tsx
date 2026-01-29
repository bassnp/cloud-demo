import { redirect } from 'next/navigation';

/**
 * Root Page
 * 
 * Redirects to the public gallery page.
 * The public gallery is the default landing page for all visitors.
 */
export default function HomePage() {
  redirect('/public');
}
