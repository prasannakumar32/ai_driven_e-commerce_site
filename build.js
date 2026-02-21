#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔨 Building AI E-commerce Platform...\n');

// Use process.cwd() instead of __dirname for better compatibility
const rootDir = process.cwd();
console.log(`📍 Root directory: ${rootDir}`);
console.log(`📍 Node version: ${process.version}`);
console.log(`📍 npm version: ${execSync('npm --version', { encoding: 'utf8' }).trim()}\n`);

// Look for frontend and backend directories
let frontendDir = path.join(rootDir, 'frontend');
let backendDir = path.join(rootDir, 'backend');

// Fallback: check if we're in a subdirectory
if (!fs.existsSync(frontendDir)) {
  console.log(`⚠️  Frontend not found at ${frontendDir}, searching...`);
  const parentDir = path.dirname(rootDir);
  frontendDir = path.join(parentDir, 'frontend');
  backendDir = path.join(parentDir, 'backend');
  console.log(`📍 Trying: ${frontendDir}`);
}

const runCommand = (command, workingDir, description) => {
  console.log(`\n${description}`);
  console.log(`   Command: ${command}`);
  console.log(`   Directory: ${workingDir}`);
  
  if (!fs.existsSync(workingDir)) {
    console.error(`❌ Directory not found: ${workingDir}`);
    process.exit(1);
  }
  
  // Verify package.json exists
  const packageJsonPath = path.join(workingDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`❌ package.json not found: ${packageJsonPath}`);
    process.exit(1);
  }
  
  try {
    execSync(command, { 
      cwd: workingDir, 
      stdio: 'inherit',
      shell: true,
      env: { 
        ...process.env, 
        npm_config_loglevel: 'warn',
        npm_config_progress: 'true'
      }
    });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`\n❌ ${description} failed!`);
    console.error(`   Exit code: ${error.status}`);
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }
};

try {
  // Verify directories exist
  if (!fs.existsSync(frontendDir)) {
    throw new Error(`Frontend directory not found: ${frontendDir}`);
  }
  if (!fs.existsSync(backendDir)) {
    throw new Error(`Backend directory not found: ${backendDir}`);
  }

  console.log(`✅ Found frontend at: ${frontendDir}`);
  console.log(`✅ Found backend at: ${backendDir}\n`);

  // Install and build frontend
  runCommand('npm install --no-audit --no-fund', frontendDir, '📦 Installing frontend dependencies');
  runCommand('npm run build', frontendDir, '🔨 Building frontend');

  // Verify build output
  const frontendBuildDir = path.join(frontendDir, 'build');
  if (!fs.existsSync(frontendBuildDir)) {
    throw new Error(`Frontend build directory not created at ${frontendBuildDir}`);
  }
  console.log(`✅ Frontend build verified at ${frontendBuildDir}`);
  
  // Install backend dependencies
  runCommand('npm install --no-audit --no-fund', backendDir, '📦 Installing backend dependencies');
  
  console.log('\n✅ Build complete!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Build failed!');
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
