# Local Development Guide - AI E-commerce Platform

## Overview
This guide helps you set up and run the AI-driven e-commerce platform locally using MongoDB Atlas as the database.

## Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB Atlas account and cluster
- Git

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd ai-ecommerce
npm install
cd client && npm install
```

### 2. MongoDB Atlas Configuration
1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Get your connection string from Atlas dashboard
5. Update the `MONGODB_URI` in your `.env` file

### 3. Environment Variables
Copy the `.env` file and update the following variables:

```bash
# React App Configuration
REACT_APP_API_URL=http://localhost:5000/api

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority

# JWT Configuration (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key

# Node Environment
NODE_ENV=development

# Cloudinary Configuration (optional, for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 4. Database Setup
Run the database seed script to populate initial data:

```bash
npm run seed
```

### 5. Running the Application

#### Development Mode
Start both backend and frontend in development mode:

```bash
# Terminal 1 - Backend server
npm run dev

# Terminal 2 - React frontend
npm run client
```

#### Production Mode
Build and run the production version:

```bash
# Build the React app
cd client && npm run build

# Start the server (serves both API and static React app)
npm start
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run client` - Start React development server
- `npm run server` - Start backend server with nodemon
- `npm run seed` - Seed the database with initial data
- `npm run test-db` - Test database connection

## Features

### Core Functionality
- User authentication and authorization
- Product catalog with AI-powered recommendations
- Shopping cart and order management
- AI chatbot for customer support
- Vector search for intelligent product discovery

### AI Features
- **AI Recommendations**: Personalized product suggestions based on user behavior
- **AI Chatbot**: Natural language processing for customer queries
- **Vector Search**: Semantic search for better product matching

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/search` - Search products

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/:id` - Remove item from cart

### AI Features
- `GET /api/ai/recommendations` - Get AI recommendations
- `POST /api/ai/chat` - Chat with AI bot
- `GET /api/ai/search` - Vector search products

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify your MongoDB URI is correct
   - Check if your IP is whitelisted in MongoDB Atlas
   - Ensure database user has proper permissions

2. **JWT Secret Error**
   - Make sure `JWT_SECRET` is set in `.env` file
   - Use a long, random string for security

3. **Port Conflict**
   - Default backend port: 5000
   - Default frontend port: 3000
   - Change if these ports are already in use

4. **Module Not Found**
   - Run `npm install` in both root and client directories
   - Clear node_modules and reinstall if needed

### Database Connection Test
```bash
npm run test-db
```

## Project Structure
```
ai-ecommerce/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── contexts/
│   └── package.json
├── database/
│   └── seed.js            # Database seeding script
├── middleware/            # Express middleware
├── models/               # Mongoose models
├── routes/               # API routes
├── server.js             # Main server file
├── utils/                # AI utilities
└── .env                  # Environment variables
```

## Security Notes
- Never commit `.env` file to version control
- Use strong JWT secrets in production
- Enable MongoDB Atlas network access restrictions
- Use HTTPS in production environments

## Support
For issues related to:
- **MongoDB Atlas**: Check Atlas documentation and status
- **Node.js/npm**: Verify versions and dependencies
- **Application**: Check logs and error messages

---

Your AI e-commerce platform is now configured to run locally with MongoDB Atlas!
