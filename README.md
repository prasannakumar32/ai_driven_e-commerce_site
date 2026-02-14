# AI-Driven E-Commerce Platform

A modern, intelligent e-commerce platform powered by artificial intelligence, featuring personalized recommendations, smart search, and an AI chatbot assistant.

## Features

### 🤖 AI-Powered Features
- **Personalized Product Recommendations**: ML algorithms analyze user behavior to suggest relevant products
- **Smart Search**: AI-enhanced search with natural language processing
- **AI Chatbot**: Intelligent customer support and shopping assistant
- **Behavioral Analysis**: Tracks user preferences and adapts recommendations

### 🛍️ E-Commerce Features
- **Product Catalog**: Advanced filtering, sorting, and search
- **Shopping Cart**: Real-time cart management with AI suggestions
- **Order Management**: Complete order processing and tracking
- **User Authentication**: Secure login/registration with JWT
- **Product Reviews**: Customer feedback and rating system

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Material-UI
- **Interactive Components**: Smooth animations and transitions
- **Accessibility**: WCAG compliant design
- **Real-time Updates**: Live cart and inventory updates

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Natural Language Processing** with Natural.js and Compromise
- **Stripe** for payment processing

### Frontend
- **React** with React Router
- **Material-UI (MUI)** for components
- **Axios** for API calls
- **Context API** for state management

### AI/ML
- **Natural Language Processing** for search and chatbot
- **Collaborative Filtering** for recommendations
- **Content-Based Filtering** for product similarity
- **Behavioral Analytics** for user profiling

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-ecommerce
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
```

4. **Set up environment variables**
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration:
- MongoDB connection string
- JWT secret key
- Stripe keys (for payments)
- Other optional services

5. **Start MongoDB**
```bash
# Make sure MongoDB is running on your system
mongod
```

6. **Start the development servers**

Backend server:
```bash
npm run dev
```

Frontend server (in a new terminal):
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get products with filtering
- `GET /api/products/:id` - Get product details
- `POST /api/products/search` - Smart search
- `GET /api/products/:id/recommendations` - Get similar products

### AI Features
- `GET /api/ai/recommendations/:userId` - Personalized recommendations
- `POST /api/ai/chatbot` - AI chatbot interaction
- `POST /api/ai/smart-search` - AI-powered search
- `GET /api/ai/trending` - Trending products

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove item from cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

## AI Features Explained

### 1. Personalized Recommendations
The system uses multiple approaches:
- **Collaborative Filtering**: Based on similar users' preferences
- **Content-Based Filtering**: Based on product attributes and user history
- **Behavioral Analysis**: Tracks browsing patterns and purchase history
- **Dynamic Scoring**: Real-time adjustment based on user interactions

### 2. Smart Search
- **Natural Language Processing**: Understands user intent
- **Semantic Search**: Finds products based on meaning, not just keywords
- **Auto-correction**: Handles typos and variations
- **Context Awareness**: Considers user preferences in search results

### 3. AI Chatbot
- **Intent Recognition**: Understands what the user wants
- **Entity Extraction**: Identifies products, categories, brands
- **Context Management**: Maintains conversation context
- **Proactive Assistance**: Suggests products and answers questions

## Database Schema

### Users
```javascript
{
  name: String,
  email: String,
  password: String,
  preferences: {
    categories: [String],
    brands: [String],
    priceRange: { min: Number, max: Number }
  },
  browsingHistory: [{ product: ObjectId, timestamp: Date }],
  aiProfile: {
    interests: [String],
    recommendationWeights: Object
  }
}
```

### Products
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  brand: String,
  images: [String],
  stock: Number,
  rating: Number,
  tags: [String],
  aiRecommendationScore: Number,
  popularity: Number
}
```

## Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ..
npm start
```

### Environment Variables for Production
- `NODE_ENV=production`
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secure JWT secret
- `STRIPE_SECRET_KEY` - Stripe API key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- [ ] Image recognition for visual search
- [ ] Voice search capabilities
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Integration with more AI services
- [ ] Real-time inventory management
- [ ] Advanced fraud detection

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

Built with ❤️ using modern web technologies and artificial intelligence.
