# 🚀 Quick Render Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub repository
- [ ] `render.yaml` file in root directory
- [ ] Backend `server.js` updated for production
- [ ] Frontend `package.json` proxy removed
- [ ] Environment variables documented
- [ ] MongoDB Atlas connection ready

## 🌐 Deployment URLs (After Deployment)

- **Frontend**: https://ai-ecommerce-frontend.onrender.com
- **Backend**: https://ai-ecommerce-backend.onrender.com
- **Backend API**: https://ai-ecommerce-backend.onrender.com/api

## 🔑 Required Environment Variables

### Backend
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://ai-ecommerce-user:trglucifer%4032K@cluster0.naulav.mongodb.net/ai-ecommerce?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Frontend
```
REACT_APP_API_URL=https://ai-ecommerce-backend.onrender.com/api
REACT_APP_URL=https://ai-ecommerce-frontend.onrender.com
```

## 📋 Render Services to Create

1. **Web Service** (Backend)
   - Name: `ai-ecommerce-backend`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build: `npm install`
   - Start: `npm start`

2. **Static Site** (Frontend)
   - Name: `ai-ecommerce-frontend`
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Publish: `build`

## 🎯 Quick Commands

```bash
# Push to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# Test locally
npm run dev

# Build for production
cd frontend && npm run build
```

## 🚨 Important Notes

- Render uses port 10000 by default
- CORS must be configured for your Render URLs
- MongoDB Atlas needs to whitelist Render's IP addresses
- Free tier services may have cold starts

## 📞 Support

- Render Documentation: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Issues: Check Render logs and MongoDB connection
