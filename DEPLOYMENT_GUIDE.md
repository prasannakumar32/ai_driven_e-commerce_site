# Render.com Deployment Guide

## 🚀 Step-by-Step Deployment Process

### Prerequisites
- GitHub account with your project pushed to a repository
- Render.com account (Free tier available)
- MongoDB Atlas account (already configured)

---

## 📋 Step 1: Prepare Your Repository

### 1.1 Push Your Code to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 1.2 Verify Your Files
Ensure you have these files in your repository:
- `render.yaml` (Root directory)
- `backend/server.js` (Updated for production)
- `frontend/package.json` (Updated for production)
- `frontend/.env.production` (Production environment variables)

---

## 🌐 Step 2: Deploy Backend on Render

### 2.1 Create Backend Service
1. Go to [Render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ai-ecommerce-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 2.2 Configure Environment Variables
Add these environment variables in the Render dashboard:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://ai-ecommerce-user:trglucifer%4032K@cluster0.naulav.mongodb.net/ai-ecommerce?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
STRIPE_SECRET_KEY=sk_test_51T1lJoEtyhAZP0CGxyxq1dbutEzmfOaXOGOlE6s1oRNxrCWc6ouSfVAq4w0kQ1be9qDHjGFvb9KlJRwgGzmZEhRw00BztN08H0
STRIPE_PUBLISHABLE_KEY=pk_test_51T1lJoEtyhAZP0CGwKrnEsUO53xOMu8bH2tud8Ic8RdTmTu4O2jhSTFLXjLTR1pvK0yAWiM8p4JxhCFK1yARjilA00ieDDTVuY
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 2.3 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment to complete
3. Note your backend URL: `https://ai-ecommerce-backend.onrender.com`

---

## 🎨 Step 3: Deploy Frontend on Render

### 3.1 Create Frontend Service
1. Go back to Render dashboard
2. Click **"New +"** → **"Static Site"**
3. Select the same GitHub repository
4. Configure the service:
   - **Name**: `ai-ecommerce-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
   - **Instance Type**: `Free`

### 3.2 Configure Frontend Environment Variables
Add these environment variables:
```
REACT_APP_API_URL=https://ai-ecommerce-backend.onrender.com/api
REACT_APP_URL=https://ai-ecommerce-frontend.onrender.com
```

### 3.3 Deploy Frontend
1. Click **"Create Static Site"**
2. Wait for deployment to complete
3. Note your frontend URL: `https://ai-ecommerce-frontend.onrender.com`

---

## 🗄️ Step 4: Set Up MongoDB Database (Alternative)

If you prefer using Render's managed database instead of MongoDB Atlas:

### 4.1 Create Database
1. Go to Render dashboard
2. Click **"New +"** → **"PostgreSQL"** or **"MongoDB"**
3. Configure:
   - **Name**: `ai-ecommerce-db`
   - **Database Name**: `ai-ecommerce`
   - **User**: `ai-ecommerce-user`
   - **Instance Type**: `Free`

### 4.2 Update Backend Environment
Replace the `MONGODB_URI` in your backend service with the connection string provided by Render.

---

## ✅ Step 5: Test Your Deployment

### 5.1 Check Backend
1. Visit `https://ai-ecommerce-backend.onrender.com/api`
2. You should see the API response or a 404 (which is normal for the root)

### 5.2 Check Frontend
1. Visit `https://ai-ecommerce-frontend.onrender.com`
2. The app should load and connect to the backend

### 5.3 Test Functionality
- User registration/login
- Product browsing
- Cart functionality
- AI features

---

## 🔧 Step 6: Post-Deployment Configuration

### 6.1 Update CORS Settings
After deployment, update the CORS origins in `backend/server.js`:
```javascript
origin: [
  'https://ai-ecommerce-frontend.onrender.com',
  'https://your-custom-domain.com' // if you have one
]
```

### 6.2 Custom Domain (Optional)
1. Go to each service in Render dashboard
2. Click **"Custom Domains"**
3. Add your domain and follow DNS instructions

### 6.3 SSL Certificates
Render automatically provides SSL certificates for all services.

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Backend Not Starting
- Check the logs in Render dashboard
- Ensure all environment variables are set
- Verify the MongoDB connection string

#### 2. Frontend Not Connecting to Backend
- Verify `REACT_APP_API_URL` is correct
- Check CORS configuration in backend
- Ensure backend is running and accessible

#### 3. Database Connection Issues
- Verify MongoDB connection string
- Check if IP is whitelisted in MongoDB Atlas
- Ensure database user has correct permissions

#### 4. Build Failures
- Check package.json scripts
- Ensure all dependencies are installable
- Review build logs for specific errors

---

## 📊 Monitoring

### Render Dashboard
- Monitor service logs
- Check metrics and performance
- Set up alerts for downtime

### Database Monitoring
- Monitor MongoDB Atlas metrics
- Check connection usage
- Set up alerts for unusual activity

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to your GitHub repository. To trigger a redeploy:

1. Push changes to GitHub
2. Or click **"Manual Deploy"** in Render dashboard
3. Services will rebuild and redeploy automatically

---

## 💡 Pro Tips

1. **Use Environment Variables**: Never hardcode sensitive information
2. **Monitor Logs**: Regularly check service logs for issues
3. **Backup Database**: Regular backups of your MongoDB database
4. **Update Dependencies**: Keep packages updated for security
5. **Test Locally**: Always test changes locally before deploying

---

## 🎉 Congratulations!

Your AI-driven e-commerce platform is now live on Render.com! 🚀

- **Frontend**: https://ai-ecommerce-frontend.onrender.com
- **Backend**: https://ai-ecommerce-backend.onrender.com
- **Database**: MongoDB Atlas or Render Database

For support, check the Render documentation or contact their support team.
