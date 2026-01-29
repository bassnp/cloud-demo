/**
 * Create Admin Account Script
 * 
 * Creates the admin user account in Firebase Authentication.
 * Run this script once to set up the admin account.
 * 
 * Usage: node scripts/create-admin.js
 * 
 * Requires .env.local with Firebase Admin SDK credentials.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Admin account configuration
const ADMIN_EMAIL = 'test@admin.admin';
const ADMIN_PASSWORD = 'Password123'; // Change this to your desired password
const ADMIN_DISPLAY_NAME = 'System Administrator';

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('   Please ensure .env.local is configured correctly.');
    process.exit(1);
  }
}

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

/**
 * Create the admin user account
 */
async function createAdminAccount() {
  console.log('\n🔧 Admin Account Setup\n');
  console.log('━'.repeat(40));

  validateEnvironment();
  initializeFirebase();

  const auth = getAuth();

  try {
    // Check if admin already exists
    const existingUser = await auth.getUserByEmail(ADMIN_EMAIL).catch(() => null);

    if (existingUser) {
      console.log(`\n✅ Admin account already exists!`);
      console.log(`   UID: ${existingUser.uid}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Display Name: ${existingUser.displayName || 'Not set'}`);
      console.log('\n💡 If you need to reset the password, use Firebase Console.');
      return;
    }

    // Create the admin user
    const userRecord = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_DISPLAY_NAME,
      emailVerified: true,
    });

    console.log('\n✅ Admin account created successfully!\n');
    console.log('━'.repeat(40));
    console.log(`   UID:          ${userRecord.uid}`);
    console.log(`   Email:        ${ADMIN_EMAIL}`);
    console.log(`   Password:     ${ADMIN_PASSWORD}`);
    console.log(`   Display Name: ${ADMIN_DISPLAY_NAME}`);
    console.log('━'.repeat(40));
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('   You can change it in Firebase Console or via the app settings.\n');

  } catch (error) {
    console.error('\n❌ Failed to create admin account:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdminAccount();
