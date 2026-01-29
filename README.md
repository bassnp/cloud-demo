# Cloud Storage Demo

A secure role-based image distribution platform built with Next.js 15, Firebase, and modern web tech
## Features

- **Secure Authentication** - Email/Password and Google OAuth via Firebase Auth
- **Role-Based Access** - Admin and user roles with distinct capabilities
- **Image Management** - Upload, organize, and share images
- **Public Gallery** - Shareable public gallery with search and lightbox
- **Responsive Design** - Mobile-first design with Tailwind CSS

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Storage**: [Cloud Storage for Firebase](https://firebase.google.com/docs/storage)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

## Prerequisites

- Node.js 18+ 
- npm or pnpm
- Firebase project with:
  - Authentication (Email/Password + Google providers)
  - Cloud Firestore
  - Cloud Storage

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/cloud-storage-demo.git
cd cloud-storage-demo
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database
4. Create a Cloud Storage bucket
5. Download your service account key (Project Settings → Service Accounts)

### 4. Set Environment Variables

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase configuration:

```bash
# Firebase Client SDK (Browser-Safe)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin SDK (Server-Only - from service account JSON)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 5. Configure Admin User

Edit `src/lib/constants.ts` and set your admin email:

```typescript
export const ADMIN_EMAIL = 'your-admin@email.com';
```

### 6. Deploy Firebase Security Rules

```bash
firebase deploy --only firestore:rules,storage
```

### 7. Verify Environment

```bash
node scripts/verify-env.js
```

### 8. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |
| `npm run test:coverage` | Run tests with coverage |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected pages (media, admin, settings)
│   ├── api/               # API routes
│   └── public/            # Public gallery
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── layout/            # Layout components (sidebar, header)
│   ├── media/             # Media management components
│   ├── public/            # Public gallery components
│   ├── settings/          # Settings components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and server actions
│   ├── firebase/          # Firebase SDK initialization
│   ├── auth/              # Authentication actions
│   ├── media/             # Media CRUD actions
│   ├── admin/             # Admin actions
│   └── validations/       # Zod schemas
└── types/                 # TypeScript type definitions
```

## Security Considerations

- **Session Management**: Uses HTTP-only session cookies (not localStorage)
- **Admin Verification**: Server-side admin role verification via email match
- **Firebase Rules**: Firestore and Storage rules enforce access control
- **Server Components**: Sensitive operations handled in Server Components
- **Input Validation**: All inputs validated with Zod schemas
- **Security Headers**: Comprehensive headers configured in `next.config.ts`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | ✅ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | ✅ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | ✅ |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | ✅ |
| `FIREBASE_PROJECT_ID` | Firebase Project ID (Admin SDK) | ✅ |
| `FIREBASE_CLIENT_EMAIL` | Service Account Email | ✅ |
| `FIREBASE_PRIVATE_KEY` | Service Account Private Key | ✅ |

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Firebase](https://firebase.google.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
