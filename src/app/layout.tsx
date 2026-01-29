import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

/**
 * Root Metadata Configuration
 * 
 * Sets the default SEO metadata for the application.
 */
export const metadata: Metadata = {
  title: 'Cloud Demo - Secure Image Distribution Platform',
  description: 'A secure role-based image distribution platform built with Next.js and Firebase',
};

/**
 * Root Layout
 * 
 * The top-level layout component that wraps all pages.
 * Provides the HTML document structure, theme provider, and global font configuration.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
