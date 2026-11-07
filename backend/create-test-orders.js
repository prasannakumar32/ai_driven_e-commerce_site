const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createTestOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-ecommerce');
    console.log('✅ Connected to MongoDB');

    // Get a customer user
    const customer = await User.findOne({ role: 'customer' });
    if (!customer) {
      console.log('❌ No customer user found');
      process.exit(1);
    }

    // Get some products
    const products = await Product.find().limit(3);
    if (products.length === 0) {
      console.log('❌ No products found');
      process.exit(1);
    }

    console.log(`Found ${products.length} products`);

    // Create test orders
    const orders = [];
    for (let i = 0; i < 5; i++) {
      const order = new Order({
        user: customer._id,
        orderItems: [
          {
            name: products[i % products.length].name,
            quantity: 1,
            image: products[i % products.length].images[0],
            price: products[i % products.length].price,
            product: products[i % products.length]._id
          }
        ],
        shippingAddress: {
          name: customer.name,
          phone: '9876543210',
          email: customer.email,
          address: '123 Main Street',
          city: 'Namakkal',
          state: 'Tamil Nadu',
          postalCode: '637001',
          country: 'India'
        },
        paymentMethod: 'COD',
        taxPrice: 100,
        shippingPrice: 50,
        totalPrice: products[i % products.length].price + 150,
        isPaid: true,
        paidAt: new Date(),
        status: 'shipped', // Ready for delivery
        statusTimeline: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 86400000),
            notes: 'Order created'
          },
          {
            status: 'processing',
            timestamp: new Date(Date.now() - 43200000),
            notes: 'Order processing'
          },
          {
            status: 'shipped',
            timestamp: new Date(),
            notes: 'Order shipped and ready for delivery'
          }
        ]
      });

      await order.save();
      orders.push(order);
      console.log(`✅ Created order ${i + 1}: ${order.orderId}`);
    }

    console.log(`\n✅ Created ${orders.length} test orders`);
    console.log('These orders are now available for delivery partners to accept');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createTestOrders();
