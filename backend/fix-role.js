const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixUserRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-ecommerce');
    console.log('✅ Connected to MongoDB');

    // Find prasanna@gmail.com and update role to delivery_partner
    const user = await User.findOne({ email: 'prasanna@gmail.com' });

    if (user) {
      console.log('Found user:', {
        email: user.email,
        currentRole: user.role,
        deliveryPartnerStatus: user.deliveryPartnerStatus
      });

      // Update role to delivery_partner
      user.role = 'delivery_partner';
      user.deliveryPartnerStatus = 'active';
      await user.save();

      console.log('✅ Updated user role to delivery_partner');
      console.log('New role:', user.role);
    } else {
      console.log('❌ User not found');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixUserRole();
