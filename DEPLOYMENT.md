# Deployment Guide for PKS Store on Render

## Fixed Issues ✅

The following issues have been resolved to fix the Render deployment:

### 1. Build Script Updated
- **Problem**: `react-scripts: not found` error
- **Solution**: Updated build script in `package.json` to install client dependencies first
```json
"build": "cd client && npm install && npm run build"
```

### 2. Node.js Version Compatibility
- **Problem**: Node.js version mismatch
- **Solution**: Updated engines to match Render's Node.js 22.x environment
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=8.0.0"
}
```

### 3. Added Render Configuration
- **File**: `render.yaml` - Configures deployment settings
- **Features**: Proper build command, start command, and environment variables

### 4. Added .gitignore
- **Purpose**: Prevents node_modules from being committed
- **Benefit**: Reduces repository size and prevents conflicts

## Deployment Steps

### 1. Push Changes to GitHub
```bash
git add .
git commit -m "Fix deployment issues - update build script and add render config"
git push origin main
```

### 2. Configure Environment Variables on Render
In your Render dashboard, set these environment variables:

**Required Variables:**
- `NODE_ENV`: `production`
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT tokens

**Optional Variables (for image uploads):**
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### 3. Deploy on Render
1. Go to your Render dashboard
2. Connect your GitHub repository
3. Render will automatically detect the Node.js app
4. The build should now succeed with the updated script

## What Was Fixed

### Before (Broken):
```bash
npm run build  # This tried to build without installing dependencies
```

### After (Fixed):
```bash
cd client && npm install && npm run build  # Installs dependencies first
```

## Troubleshooting

If deployment still fails:

1. **Check Build Logs**: Look for specific error messages
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Check Node.js Version**: Make sure it's compatible with the engines specification
4. **Clear Cache**: Try clearing the build cache in Render settings

## Production Considerations

1. **Database**: Ensure MongoDB is accessible from Render's network
2. **Environment Variables**: Never commit sensitive data to git
3. **Static Assets**: The React build is served from the Express server
4. **API Endpoints**: All API calls should use relative paths for production

## Success Indicators

✅ Build completes without `react-scripts: not found` error
✅ Client dependencies are installed successfully
✅ React app builds to `client/build` directory
✅ Express server starts and serves the built app
✅ Database connection is established

Your PKS Store should now deploy successfully on Render!
