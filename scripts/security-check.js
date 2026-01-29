#!/usr/bin/env node
/**
 * Pre-commit Security Check Script
 * 
 * Run this before committing to ensure no sensitive data is exposed.
 * Usage: node scripts/security-check.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
};

// Patterns that indicate REAL credentials (not templates)
const SENSITIVE_PATTERNS = [
  {
    name: 'Firebase API Key (real)',
    pattern: /AIzaSy[a-zA-Z0-9_-]{33}/g,
  },
  {
    name: 'Private Key Content (real)',
    // Match actual key content, not just the header
    pattern: /MIIEv[a-zA-Z0-9+/=]{200,}/g,
  },
];

// Template patterns that are OK in example files
const TEMPLATE_PATTERNS = [
  /your-api-key/i,
  /your-project-id/i,
  /xxxxx/i,
  /YOUR_PRIVATE_KEY_HERE/i,
];

const SENSITIVE_FILES = [
  { pattern: /^\.env\.local$/, critical: true },
  { pattern: /^\.env$/, critical: true },
  { pattern: /service.*account.*\.json$/i, critical: true },
  { pattern: /-adminsdk-.*\.json$/i, critical: true },
  { pattern: /\.pem$/, critical: true },
  { pattern: /\.key$/, critical: true },
];

const IGNORED_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'coverage',
];

// Files that are examples/templates - check for real creds only
const TEMPLATE_FILES = [
  '.env.example',
  'README.md',
  'AGENTS.md',
];

let hasIssues = false;
let warnings = [];

function isTemplateFile(filePath) {
  const fileName = path.basename(filePath);
  return TEMPLATE_FILES.includes(fileName) || 
         filePath.includes('_devnotes') ||
         filePath.includes('scripts');
}

function containsTemplatePattern(content) {
  return TEMPLATE_PATTERNS.some(pattern => pattern.test(content));
}

function checkFile(filePath) {
  const ext = path.extname(filePath);
  const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt'];
  const fileName = path.basename(filePath);
  
  // Skip env files - they should just not be committed
  if (fileName.startsWith('.env') && !fileName.includes('example')) {
    return;
  }
  
  if (!textExtensions.includes(ext)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    for (const { name, pattern } of SENSITIVE_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        // If it's a template file, only warn
        if (isTemplateFile(filePath)) {
          warnings.push({
            file: filePath,
            pattern: name,
            match: matches[0].substring(0, 50),
          });
        } else {
          console.error(`${colors.red}✗ SENSITIVE DATA FOUND${colors.reset}`);
          console.error(`  File: ${filePath}`);
          console.error(`  Pattern: ${name}`);
          console.error(`  Match preview: ${matches[0].substring(0, 50)}...`);
          console.error('');
          hasIssues = true;
        }
      }
    }
  } catch {
    // Ignore read errors
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.includes(entry.name)) {
        walkDir(fullPath);
      }
    } else {
      // Check for sensitive file patterns
      for (const { pattern, critical } of SENSITIVE_FILES) {
        if (pattern.test(entry.name) && !entry.name.includes('example')) {
          if (critical) {
            console.error(`${colors.red}✗ CRITICAL FILE EXISTS: ${entry.name}${colors.reset}`);
            console.error(`  Path: ${fullPath}`);
            console.error(`  This file MUST NOT be committed to git.`);
            console.error(`  Verify it's in .gitignore`);
            console.error('');
          }
        }
      }
      
      checkFile(fullPath);
    }
  }
}

console.log(`${colors.bold}🔒 Running Security Check...${colors.reset}\n`);

const projectRoot = path.resolve(__dirname, '..');
walkDir(projectRoot);

// Check .gitignore exists and has essential patterns
const gitignorePath = path.join(projectRoot, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  const requiredPatterns = ['.env.local', 'service-account', '.pem', '-adminsdk-'];
  
  let missingPatterns = [];
  for (const pattern of requiredPatterns) {
    if (!gitignore.includes(pattern)) {
      missingPatterns.push(pattern);
    }
  }
  
  if (missingPatterns.length > 0) {
    console.error(`${colors.yellow}⚠ MISSING GITIGNORE PATTERNS: ${missingPatterns.join(', ')}${colors.reset}`);
    hasIssues = true;
  }
} else {
  console.error(`${colors.red}✗ .gitignore FILE NOT FOUND${colors.reset}`);
  hasIssues = true;
}

// Show warnings (non-critical)
if (warnings.length > 0) {
  console.log(`${colors.yellow}⚠ Template file warnings (review manually):${colors.reset}`);
  for (const w of warnings) {
    console.log(`  - ${path.basename(w.file)}: ${w.pattern}`);
  }
  console.log('');
}

if (hasIssues) {
  console.error(`\n${colors.red}${colors.bold}✗ Security check FAILED${colors.reset}`);
  console.error('Please remove sensitive data before committing.');
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}✓ Security check PASSED${colors.reset}`);
  console.log('No sensitive data detected in source files.');
  process.exit(0);
}
