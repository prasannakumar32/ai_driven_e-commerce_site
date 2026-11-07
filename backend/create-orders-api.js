const axios = require('axios');

const API_URL = 'http://localhost:10000/api';

async function createTestOrders() {
  try {
    // Login as admin
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      loginIdentifier: 'admin@pks.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Logged in as admin');

    // Create test orders
    const createResponse = await axios.post(
      `${API_URL}/admin/create-test-orders`,
      { count: 5 },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Test orders created:', createResponse.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createTestOrders();
