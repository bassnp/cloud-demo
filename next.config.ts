import type { NextConfig } from 'next';

/**
 * Next.js Configuration
 *
 * Configures Firebase Storage remote patterns for next/image optimization
 * and comprehensive security headers for production deployment.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
        pathname: '/**',
      },
      {
        // Google profile photos
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  // Enable Server Actions with increased body size limit for image uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },

  // Comprehensive security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // DNS prefetch control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Permissions Policy (formerly Feature-Policy)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          // Strict Transport Security (HTTPS only)
          // Only enable in production with HTTPS
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
                },
              ]
            : []),
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self, inline for Next.js, and Google APIs
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseio.com",
              // Styles: self and inline for Tailwind
              "style-src 'self' 'unsafe-inline'",
              // Images: self, data URIs, Firebase Storage, Google
              "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://*.firebasestorage.app https://lh3.googleusercontent.com",
              // Fonts: self and Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Connect: Firebase services
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
              // Frame: Google OAuth popups
              "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com",
              // Object/embed: none
              "object-src 'none'",
              // Base URI: self only
              "base-uri 'self'",
              // Form actions: self only
              "form-action 'self'",
              // Frame ancestors: none (prevent embedding)
              "frame-ancestors 'none'",
              // Upgrade insecure requests in production
              ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
