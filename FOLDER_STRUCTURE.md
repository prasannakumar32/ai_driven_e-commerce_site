# Project Structure Guide

## Folder Organization

Your AI E-Commerce project has been successfully split into a clean frontend/backend structure:

```
ai-ecommerce/
├── backend/
│   ├── database/          - MongoDB configuration and seed data
│   ├── middleware/        - Express middleware (auth, etc.)
│   ├── models/           - Mongoose schemas (User, Product, Order)
│   ├── routes/           - API endpoint handlers
│   ├── scripts/          - Utility and setup scripts
│   ├── server/           - Server utilities (imageRoutes, etc.)
│   ├── utils/            - AI utilities (search, recommendations, embeddings)
│   ├── public/           - Static files for backend
│   ├── package.json      - Backend dependencies
│   └── server.js         - Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/   - React components (Header, Cart, etc.)
│   │   ├── pages/        - Page components (Home, Products, etc.)
│   │   ├── contexts/     - Context API (AuthContext, CartContext)
│   │   ├── utils/        - Frontend utilities (API client, etc.)
│   │   ├── App.js        - Main App component
│   │   └── index.js      - React entry point
│   ├── public/           - Static assets
│   ├── build/            - Production build (created by npm run build)
│   ├── package.json      - Frontend dependencies
│   └── README.md         - Frontend-specific documentation
│
├── .env                  - Environment variables (shared)
├── .env.example          - Example environment file
├── package.json          - Root orchestration file
├── README.md             - Main project documentation
└── LOCAL_DEVELOPMENT.md  - Development setup guide
```

## Running the Application

### Install All Dependencies
```bash
npm run install:all
```

### Development Mode (Run Both Frontend & Backend)
```bash
npm run dev
```
This uses `concurrently` to run both servers in one terminal:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Run Separately

**Backend only:**
```bash
npm run dev:backend
# or: cd backend && npm run dev
```

**Frontend only:**
```bash
npm run dev:frontend
# or: cd frontend && npm start
```

### Production Build
```bash
npm run build
```
Builds the frontend React app and prepares backend for production.

### Other Commands

**Seed database:**
```bash
npm run seed
```

**Test database connection:**
```bash
npm run test-db
```

**Setup MongoDB Atlas:**
```bash
npm run setup-atlas
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
STRIPE_PUBLIC_KEY=...
STRIPE_SECRET_KEY=...
PORT=5000
NODE_ENV=development
```

## Key Configuration Changes

After the restructuring:
- Backend now serves the frontend build from `../frontend/build`
- All routes remain the same (`/api/*`)
- Frontend proxy still points to `http://localhost:5000`
- Environment variables work across both parts

## API Endpoints

Backend API is available at:
- Base: `http://localhost:5000/api`
- Auth: `/api/auth`
- Products: `/api/products`
- Cart: `/api/cart`
- Orders: `/api/orders`
- AI: `/api/ai`
- Stripe: `/api/stripe`

## Frontend Pages

- Home: `/`
- Products: `/products`
- Product Detail: `/product/:id`
- Cart: `/cart`
- Login: `/login`
- Register: `/register`
- Checkout: `/checkout`
- Profile: `/profile`
- Seller Dashboard: `/seller-dashboard`
- Order Tracking: `/order-tracking`

---

**Ready to develop!** Your app is now organized with clear separation of concerns between frontend and backend.
