#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔨 Building AI E-commerce Platform...\n');

try {
  // Install and build frontend
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });
  
  console.log('\n🔨 Building frontend...');
  execSync('npm run build', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });
  
  // Install backend dependencies
  console.log('\n📦 Installing backend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
  
  console.log('\n✅ Build complete!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Build failed!');
  process.exit(1);
}
