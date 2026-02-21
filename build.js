#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔨 Building AI E-commerce Platform...\n');

// Find the root directory by looking for package.json with our project name
let rootDir = path.dirname(path.resolve(__filename));
console.log(`📍 Script location: ${__filename}`);
console.log(`📍 Initial directory: ${rootDir}`);

// Walk up the directory tree to find the actual project root
const findProjectRoot = (startDir) => {
  let currentDir = startDir;
  
  while (currentDir !== path.dirname(currentDir)) { // Stop at filesystem root
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check if this is the root package.json (has specific scripts)
      if (packageJson.scripts && packageJson.scripts.build === 'node build.js') {
        return currentDir;
      }
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  return startDir;
};

rootDir = findProjectRoot(rootDir);
console.log(`📍 Project root: ${rootDir}\n`);

// Verify frontend and backend exist
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

console.log(`📍 Frontend directory: ${frontendDir}`);
console.log(`📍 Backend directory: ${backendDir}\n`);

const runCommand = (command, workingDir, description) => {
  console.log(`\n${description}`);
  console.log(`   Command: ${command}`);
  console.log(`   Working directory: ${workingDir}`);
  
  if (!fs.existsSync(workingDir)) {
    console.error(`❌ Directory not found: ${workingDir}`);
    console.error(`   Current dir: ${process.cwd()}`);
    console.error(`   __dirname: ${__dirname}`);
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
    console.error(`   Working directory: ${workingDir}`);
    console.error(`   Exit code: ${error.status}`);
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
