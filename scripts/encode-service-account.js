/**
 * Utility script to Base64 encode the Firebase service account JSON
 * 
 * Usage:
 *   node scripts/encode-service-account.js path/to/serviceAccountKey.json
 * 
 * Or if no path provided, it will look for the JSON file in the current directory
 * 
 * Copy the output and use it as FIREBASE_SERVICE_ACCOUNT_BASE64 in Sevalla
 */

const fs = require('fs');
const path = require('path');

// Get the service account file path from command line or search for it
let serviceAccountPath = process.argv[2];

if (!serviceAccountPath) {
  // Look for service account JSON files in current directory
  const files = fs.readdirSync(process.cwd());
  const serviceAccountFile = files.find(f => 
    f.endsWith('.json') && 
    (f.includes('firebase-adminsdk') || f.includes('serviceAccount'))
  );
  
  if (serviceAccountFile) {
    serviceAccountPath = path.join(process.cwd(), serviceAccountFile);
    console.log(`Found service account file: ${serviceAccountFile}\n`);
  } else {
    console.error('Usage: node scripts/encode-service-account.js <path-to-service-account.json>');
    console.error('\nNo service account JSON file found in current directory.');
    console.error('Download it from Firebase Console > Project Settings > Service Accounts');
    process.exit(1);
  }
}

// Read and encode the service account JSON
try {
  const serviceAccount = fs.readFileSync(serviceAccountPath, 'utf8');
  
  // Validate it's valid JSON with required fields
  const parsed = JSON.parse(serviceAccount);
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    console.error('Invalid service account JSON. Missing required fields.');
    process.exit(1);
  }
  
  // Base64 encode
  const base64 = Buffer.from(serviceAccount).toString('base64');
  
  console.log('=== FIREBASE_SERVICE_ACCOUNT_BASE64 ===\n');
  console.log(base64);
  console.log('\n=== Instructions for Sevalla ===');
  console.log('1. In Sevalla, add environment variable: FIREBASE_SERVICE_ACCOUNT_BASE64');
  console.log('2. Paste the Base64 string above as the value');
  console.log('3. You can REMOVE these individual variables:');
  console.log('   - FIREBASE_PROJECT_ID');
  console.log('   - FIREBASE_CLIENT_EMAIL');
  console.log('   - FIREBASE_PRIVATE_KEY');
  console.log('4. Redeploy your application\n');
  
} catch (error) {
  console.error(`Error reading service account file: ${error.message}`);
  process.exit(1);
}
