# Render Deployment Fix - Step by Step

## Problem
Render is still using the old build command `npm run build` which causes the error:
```
sh: 1: react-scripts: not found
```

## Solution Steps

### 1. Manual Configuration in Render Dashboard

Since Render might not be reading the `render.yaml` file properly, you need to manually configure the build settings:

1. **Go to your Render Dashboard**
2. **Select your Web Service**
3. **Click "Settings" tab**
4. **Update the Build Command**:
   ```
   cd client && npm install && npm run build
   ```
5. **Keep Start Command as**:
   ```
   npm start
   ```

### 2. Alternative: Use build:client script

If the above doesn't work, try this build command:
```
npm run build:client
```

### 3. Environment Variables

Make sure these are set in Render Dashboard:
- `NODE_ENV=production`
- `MONGODB_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_jwt_secret`
- Cloudinary variables (if using images)

### 4. Force New Deployment

After making changes:
1. Go to your service in Render Dashboard
2. Click "Manual Deploy"
3. Select "Deploy Latest Commit"

### 5. What the Fixed Build Process Does

The corrected build command:
```bash
cd client && npm install && npm run build
```

This sequence:
1. `cd client` - Navigate to React app directory
2. `npm install` - Install all client dependencies (including react-scripts)
3. `npm run build` - Build the React app

### 6. Verification

After deployment, you should see:
- ✅ Build completes without `react-scripts: not found` error
- ✅ Client dependencies are installed successfully
- ✅ React app builds to `client/build` directory
- ✅ Express server starts and serves the app

### 7. Troubleshooting

If still failing:

#### Check Build Logs
- Look for the exact command being run
- Verify it's using the updated build command

#### Clear Render Cache
- In Render Dashboard → Settings → Advanced
- Click "Clear Build Cache"

#### Verify Git Commit
- Ensure Render is using the latest commit: `1efd5b6`
- Old commit was: `69ee4d854278c2fc8eee50648ac94cf1440a2b2d`

### 8. Expected Working Configuration

**Render Settings:**
- **Build Command**: `cd client && npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 22.x (default)

**Files Updated:**
- `package.json` - Fixed build script
- `render.yaml` - Updated build configuration
- Added `build:client` script as backup

The deployment should now work correctly with these fixes!
