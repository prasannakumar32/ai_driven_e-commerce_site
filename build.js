#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔨 Building AI E-commerce Platform...\n');

const frontendDir = path.join(__dirname, 'frontend');
const backendDir = path.join(__dirname, 'backend');

const runCommand = (command, workingDir, description) => {
  console.log(`\n${description}`);
  console.log(`   Command: ${command}`);
  console.log(`   Directory: ${workingDir}`);
  try {
    execSync(command, { 
      cwd: workingDir, 
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, npm_config_loglevel: 'warn' }
    });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed!`);
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

  // Clean build artifacts (optional but recommended)
  console.log('🧹 Cleaning build artifacts...');
  const frontendBuildDir = path.join(frontendDir, 'build');
  const frontendNodeModules = path.join(frontendDir, 'node_modules');
  
  if (fs.existsSync(frontendBuildDir)) {
    console.log('   Removing frontend/build...');
    fs.rmSync(frontendBuildDir, { recursive: true, force: true });
  }

  // Install and build frontend
  runCommand('npm install', frontendDir, '📦 Installing frontend dependencies');
  runCommand('npm run build', frontendDir, '🔨 Building frontend');

  // Verify build output
  if (!fs.existsSync(frontendBuildDir)) {
    throw new Error(`Frontend build directory not created at ${frontendBuildDir}`);
  }
  console.log(`✅ Frontend build verified at ${frontendBuildDir}`);
  
  // Install backend dependencies
  runCommand('npm install', backendDir, '📦 Installing backend dependencies');
  
  console.log('\n✅ Build complete!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Build failed!');
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
