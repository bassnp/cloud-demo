# AGENTS.md - Cloud Storage Demo

This file provides AI coding assistants with context about the project.

---

## Stack

Next.js 15 (App Router), Firebase (Auth, Firestore, Storage), Shadcn UI, Tailwind CSS, Zod, React Hook Form

## Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Production build (runs type checking)
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest unit tests
- `firebase deploy --only firestore:rules,storage` - Deploy security rules

## Architecture

- `src/app/(auth)/` - Login/signup pages (public routes)
- `src/app/(dashboard)/` - Media, Admin, Settings (requires auth)
- `src/app/public/` - Public gallery (open to all)
- `src/lib/firebase/` - Firebase client/admin SDK setup
- `src/lib/constants.ts` - App constants including `ADMIN_EMAIL` and `isAdminUser()`
- `src/lib/validations/` - Zod validation schemas (auth, upload, settings)
- `src/components/ui/` - Shadcn UI components
- `src/types/` - TypeScript interfaces

## Security Conventions

- Use HTTP-only session cookies (NOT localStorage) for auth tokens
- Validate admin role via `isAdminUser(email)` check (configure admin email in constants.ts)
- All file uploads must validate MIME type (`image/*`) and size (<5MB) in storage.rules
- Server Components handle sensitive data; never expose Firebase Admin SDK to client
- Admin SDK module uses `import 'server-only'` to prevent client imports

## Code Style

- TypeScript strict mode; use Zod schemas for form/API validation
- Use `next/image` with Firebase Storage remotePatterns configured
- Compress images client-side with `browser-image-compression` before upload
- Masonry layout: use Tailwind `columns-*` with `break-inside-avoid`

## Environment Setup

- Requires `.env.local` with 9 environment variables (see `.env.example`)
- Run `node scripts/verify-env.js` to validate environment configuration
- Admin SDK credentials from service account JSON (NEVER commit)
- Client SDK credentials from Firebase Console Web App config
