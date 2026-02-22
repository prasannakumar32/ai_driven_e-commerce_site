@echo off
REM render-deploy.bat - Helper script to prepare for Render deployment

echo.
echo 🚀 AI E-Commerce Platform - Render.com Deployment Setup
echo ========================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

FOR /F "tokens=*" %%i IN ('node --version') DO set NODE_VERSION=%%i
FOR /F "tokens=*" %%i IN ('npm --version') DO set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM Check for JWT generation
echo 📝 Generating a secure JWT secret for you...
echo.

REM Using PowerShell to generate secure random secret
FOR /F "delims=" %%i IN ('powershell -Command "[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))"') DO set JWT_SECRET=%%i

echo 📋 Your Generated JWT Secret:
echo.
echo    %JWT_SECRET%
echo.
echo ⚠️  Save this - you'll need it for Render!
echo.

REM Create or check .env file
if exist .env (
    echo ✅ .env file exists
) else (
    if exist .env.example (
        echo 📝 Creating .env file from .env.example...
        copy .env.example .env
        echo ℹ️  Created .env - Please update with your actual credentials
    ) else (
        echo ⚠️  .env.example not found!
    )
)

echo.
echo 📋 Deployment Configuration Checklist
echo ====================================
echo.
echo Required steps before deploying to Render.com:
echo.
echo 1. MongoDB Atlas Setup:
echo    [ ] Go to https://www.mongodb.com/cloud/atlas
echo    [ ] Create a cluster
echo    [ ] Get connection string
echo    [ ] Add Render IP to IP whitelist (use 0.0.0.0/0 for simplicity)
echo    [ ] Update MONGODB_URI in Render environment
echo.

echo 2. Stripe Setup:
echo    [ ] Go to https://dashboard.stripe.com
echo    [ ] Get Secret Key and Publishable Key
echo    [ ] Get Webhook Secret
echo    [ ] Update STRIPE_* in Render
echo.

echo 3. Cloudinary Setup:
echo    [ ] Go to https://cloudinary.com/console
echo    [ ] Get Cloud Name, API Key, API Secret
echo    [ ] Update CLOUDINARY_* in Render
echo.

echo 4. JWT Secret:
echo    [ ] Use this generated secret: %JWT_SECRET%
echo    [ ] Add to Render JWT_SECRET environment variable
echo.

echo 5. Render.com Setup:
echo    [ ] Create account at https://render.com
echo    [ ] Create New Web Service
echo    [ ] Connect your GitHub repository
echo    [ ] Build Command: npm install ^&^& npm run build
echo    [ ] Start Command: npm start
echo    [ ] Set all environment variables
echo.

echo 6. Deploy:
echo    [ ] Push to GitHub (main branch)
echo    [ ] Render auto-deploys
echo    [ ] Monitor at https://dashboard.render.com
echo.

echo ✅ Setup complete!
echo.
echo For detailed guide, read: DEPLOYMENT_RENDER.md
echo.
pause
