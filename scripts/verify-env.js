/**
 * Environment Verification Script
 * 
 * Validates that all required environment variables are set and properly formatted.
 * Run with: node scripts/verify-env.js
 * 
 * Exit codes:
 *   0 - All variables valid
 *   1 - Missing or invalid variables
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Parse .env.local file and load into process.env
 */
function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error(`${colors.red}✗ .env.local file not found at: ${envPath}${colors.reset}`);
    console.log(`${colors.yellow}  Create .env.local from the template in PHASE_0_ENVIRONMENT_REQUIREMENTS.md${colors.reset}`);
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Parse KEY="VALUE" or KEY=VALUE
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      process.env[key] = value;
    }
  }

  return true;
}

/**
 * Required environment variables
 * 
 * For production deployments (Sevalla, Vercel, etc.), FIREBASE_SERVICE_ACCOUNT_BASE64
 * is strongly recommended over individual FIREBASE_* variables because it avoids
 * escape character issues with private keys.
 */
const requiredClientVars = [
  {
    key: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    description: 'Firebase API Key (Web App config)',
    validate: (val) => val.startsWith('AIza'),
    errorMsg: 'Should start with "AIza"',
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    description: 'Firebase Auth Domain',
    validate: (val) => val.includes('.firebaseapp.com'),
    errorMsg: 'Should end with ".firebaseapp.com"',
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    description: 'Firebase Project ID',
    validate: (val) => val.length > 0 && !val.includes('REPLACE'),
    errorMsg: 'Must be set to your project ID',
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    description: 'Firebase Storage Bucket',
    validate: (val) => val.includes('.firebasestorage.app') || val.includes('.appspot.com'),
    errorMsg: 'Should end with ".firebasestorage.app" or ".appspot.com"',
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    description: 'Firebase Messaging Sender ID',
    validate: (val) => /^\d+$/.test(val),
    errorMsg: 'Should be a numeric string',
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    description: 'Firebase App ID',
    validate: (val) => val.includes(':') && val.includes(':web:'),
    errorMsg: 'Should be in format "1:xxx:web:xxx"',
  },
];

/**
 * Admin SDK variables - used when FIREBASE_SERVICE_ACCOUNT_BASE64 is NOT set
 */
const requiredAdminVars = [
  {
    key: 'FIREBASE_PROJECT_ID',
    description: 'Firebase Admin Project ID',
    validate: (val) => val.length > 0 && !val.includes('REPLACE'),
    errorMsg: 'Must be set to your project ID',
  },
  {
    key: 'FIREBASE_CLIENT_EMAIL',
    description: 'Firebase Admin Service Account Email',
    validate: (val) => val.includes('@') && val.includes('.iam.gserviceaccount.com'),
    errorMsg: 'Should be a service account email',
  },
  {
    key: 'FIREBASE_PRIVATE_KEY',
    description: 'Firebase Admin Private Key',
    validate: (val) => {
      const normalized = val.replace(/\\n/g, '\n');
      return normalized.includes('-----BEGIN PRIVATE KEY-----') &&
             normalized.includes('-----END PRIVATE KEY-----');
    },
    errorMsg: 'Should contain a valid PEM private key',
  },
];

/**
 * Validate Base64-encoded service account
 */
function validateBase64ServiceAccount(base64) {
  try {
    const cleanedBase64 = base64.replace(/\s/g, '');
    const json = Buffer.from(cleanedBase64, 'base64').toString('utf-8');
    const parsed = JSON.parse(json);
    
    const requiredFields = ['project_id', 'client_email', 'private_key'];
    const missingFields = requiredFields.filter(field => !parsed[field]);
    
    if (missingFields.length > 0) {
      return { valid: false, error: `Missing fields in decoded JSON: ${missingFields.join(', ')}` };
    }
    
    // Validate the private key format
    const pk = parsed.private_key;
    if (!pk.includes('-----BEGIN PRIVATE KEY-----') || !pk.includes('-----END PRIVATE KEY-----')) {
      return { valid: false, error: 'Invalid private key format in decoded JSON' };
    }
    
    return { valid: true, projectId: parsed.project_id };
  } catch (error) {
    return { valid: false, error: `Failed to decode: ${error.message}` };
  }
}

/**
 * Main verification function
 */
function verify() {
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Cloud Demo - Environment Verification${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  // Load environment file
  if (!loadEnvFile()) {
    process.exit(1);
  }

  let allValid = true;
  const results = [];

  // Check client-side variables (always required)
  console.log(`${colors.bold}Checking client-side Firebase variables...${colors.reset}\n`);
  
  for (const variable of requiredClientVars) {
    const value = process.env[variable.key];
    
    if (!value) {
      results.push({
        status: 'missing',
        key: variable.key,
        description: variable.description,
      });
      allValid = false;
    } else if (!variable.validate(value)) {
      results.push({
        status: 'invalid',
        key: variable.key,
        description: variable.description,
        errorMsg: variable.errorMsg,
      });
      allValid = false;
    } else {
      results.push({
        status: 'valid',
        key: variable.key,
        description: variable.description,
      });
    }
  }

  // Print client results
  for (const result of results) {
    if (result.status === 'valid') {
      console.log(`  ${colors.green}✓${colors.reset} ${result.key}`);
    } else if (result.status === 'missing') {
      console.log(`  ${colors.red}✗${colors.reset} ${result.key} - ${colors.red}MISSING${colors.reset}`);
      console.log(`    ${colors.yellow}└─ ${result.description}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${result.key} - ${colors.red}INVALID${colors.reset}`);
      console.log(`    ${colors.yellow}└─ ${result.errorMsg}${colors.reset}`);
    }
  }

  // Check admin SDK configuration
  console.log(`\n${colors.bold}Checking Firebase Admin SDK configuration...${colors.reset}\n`);
  
  const hasBase64 = !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const hasIndividual = !!(process.env.FIREBASE_PROJECT_ID && 
                          process.env.FIREBASE_CLIENT_EMAIL && 
                          process.env.FIREBASE_PRIVATE_KEY);

  if (hasBase64) {
    // Validate Base64 method (recommended)
    console.log(`  ${colors.cyan}Using Base64-encoded service account (recommended)${colors.reset}\n`);
    const base64Result = validateBase64ServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64);
    
    if (base64Result.valid) {
      console.log(`  ${colors.green}✓${colors.reset} FIREBASE_SERVICE_ACCOUNT_BASE64`);
      console.log(`    ${colors.cyan}└─ Project ID: ${base64Result.projectId}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} FIREBASE_SERVICE_ACCOUNT_BASE64 - ${colors.red}INVALID${colors.reset}`);
      console.log(`    ${colors.yellow}└─ ${base64Result.error}${colors.reset}`);
      console.log(`    ${colors.yellow}└─ Generate with: node scripts/encode-service-account.js <path-to-json>${colors.reset}`);
      allValid = false;
    }
  } else if (hasIndividual) {
    // Validate individual variables method
    console.log(`  ${colors.yellow}Using individual environment variables${colors.reset}`);
    console.log(`  ${colors.yellow}⚠ For production deployments, use FIREBASE_SERVICE_ACCOUNT_BASE64 instead${colors.reset}`);
    console.log(`  ${colors.yellow}  to avoid private key escape character issues.${colors.reset}\n`);
    
    for (const variable of requiredAdminVars) {
      const value = process.env[variable.key];
      
      if (!value) {
        console.log(`  ${colors.red}✗${colors.reset} ${variable.key} - ${colors.red}MISSING${colors.reset}`);
        console.log(`    ${colors.yellow}└─ ${variable.description}${colors.reset}`);
        allValid = false;
      } else if (!variable.validate(value)) {
        console.log(`  ${colors.red}✗${colors.reset} ${variable.key} - ${colors.red}INVALID${colors.reset}`);
        console.log(`    ${colors.yellow}└─ ${variable.errorMsg}${colors.reset}`);
        allValid = false;
      } else {
        console.log(`  ${colors.green}✓${colors.reset} ${variable.key}`);
      }
    }
    
    // Test private key parsing
    console.log(`\n${colors.bold}Testing private key format...${colors.reset}\n`);
    
    try {
      const pk = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      if (pk && pk.includes('-----BEGIN PRIVATE KEY-----')) {
        console.log(`  ${colors.green}✓${colors.reset} Private key format appears valid`);
        console.log(`  ${colors.yellow}⚠ Note: This may still fail in production if escape characters are stripped.${colors.reset}`);
        console.log(`  ${colors.yellow}  If deployment fails, switch to FIREBASE_SERVICE_ACCOUNT_BASE64.${colors.reset}`);
      } else {
        throw new Error('Invalid key format');
      }
    } catch (e) {
      console.log(`  ${colors.red}✗${colors.reset} Private key parse error: ${e.message}`);
      allValid = false;
    }
  } else {
    // No admin configuration found
    console.log(`  ${colors.red}✗${colors.reset} No Firebase Admin SDK credentials found`);
    console.log(`    ${colors.yellow}└─ Set FIREBASE_SERVICE_ACCOUNT_BASE64 (recommended for production)${colors.reset}`);
    console.log(`    ${colors.yellow}└─ Or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY${colors.reset}`);
    allValid = false;
  }

  // Summary
  console.log(`\n${colors.bold}${colors.cyan}───────────────────────────────────────────────────────────────${colors.reset}`);
  
  if (allValid) {
    console.log(`\n  ${colors.green}${colors.bold}✓ All environment variables are valid!${colors.reset}`);
    console.log(`  ${colors.cyan}Ready to proceed with development.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n  ${colors.red}${colors.bold}✗ Environment validation failed.${colors.reset}`);
    console.log(`  ${colors.yellow}Please fix the issues above before proceeding.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run verification
verify();
