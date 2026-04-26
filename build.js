/**
 * build.js — Render production build script
 * 1. Installs backend dependencies
 * 2. Installs frontend dependencies  
 * 3. Builds the React frontend into /frontend/build
 * 4. The backend (server.js) then serves the built files as static assets
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const BACKEND_DIR = path.join(ROOT, 'backend');
const FRONTEND_DIR = path.join(ROOT, 'frontend');

function run(cmd, cwd = ROOT) {
  console.log(`\n▶ ${cmd}  [cwd: ${cwd}]`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

console.log('🔨 Starting production build...\n');

// 1. Install backend dependencies
console.log('📦 Installing backend dependencies...');
run('npm install --production=false', BACKEND_DIR);

// 2. Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
run('npm install --production=false', FRONTEND_DIR);

// 3. Build React frontend
console.log('⚛️  Building React frontend...');
run('npm run build', FRONTEND_DIR);

// 4. Confirm build output exists
const buildDir = path.join(FRONTEND_DIR, 'build');
if (fs.existsSync(buildDir)) {
  console.log('\n✅ Build complete! Frontend output: frontend/build');
} else {
  console.error('\n❌ Build failed: frontend/build directory not found');
  process.exit(1);
}
