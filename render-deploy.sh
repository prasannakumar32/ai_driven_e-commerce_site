#!/bin/bash
# render-deploy.sh - Helper script to prepare for Render deployment

set -e

echo "🚀 AI E-Commerce Platform - Render.com Deployment Setup"
echo "========================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Generate JWT Secret if not in .env
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "ℹ️  Created .env - Please update with your actual credentials"
else
    echo "✅ .env file exists"
fi

echo ""
echo "📋 Deployment Configuration Checklist:"
echo "==========================================="
echo ""
echo "Required steps before deploying to Render.com:"
echo ""
echo "1. MongoDB Atlas Setup:"
echo "   [ ] Create MongoDB cluster at https://www.mongodb.com/cloud/atlas"
echo "   [ ] Get connection string (looks like: mongodb+srv://user:pass@cluster.mongodb.net/dbname)"
echo "   [ ] Add Render IP to IP whitelist (or use 0.0.0.0/0)"
echo "   [ ] Update MONGODB_URI in Render environment variables"
echo ""

echo "2. Stripe Setup:"
echo "   [ ] Create Stripe account at https://stripe.com"
echo "   [ ] Get API Keys from https://dashboard.stripe.com/apikeys"
echo "   [ ] Get Webhook Secret from https://dashboard.stripe.com/webhooks"
echo "   [ ] Update STRIPE_* in Render environment variables"
echo ""

echo "3. Cloudinary Setup:"
echo "   [ ] Create Cloudinary account at https://cloudinary.com"
echo "   [ ] Get credentials from https://cloudinary.com/console"
echo "   [ ] Update CLOUDINARY_* in Render environment variables"
echo ""

echo "4. JWT Secret:"
echo "   [ ] Generate secure JWT secret:"
echo ""
SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "       Generated: $SECRET"
echo "   [ ] Copy this to Render JWT_SECRET environment variable"
echo ""

echo "5. Render.com Setup:"
echo "   [ ] Create account at https://render.com"
echo "   [ ] Connect GitHub repository"
echo "   [ ] Create New Web Service"
echo "   [ ] Use main branch"
echo "   [ ] Build Command: npm install && npm run build"
echo "   [ ] Start Command: npm start"
echo "   [ ] Add all environment variables (see above)"
echo ""

echo "6. Deployment:"
echo "   [ ] Push changes to GitHub (main branch)"
echo "   [ ] Render will auto-deploy"
echo "   [ ] Monitor build logs at https://dashboard.render.com"
echo ""

echo "✅ Setup preparation complete!"
echo ""
echo "For detailed deployment guide, see: DEPLOYMENT_RENDER.md"
echo ""
