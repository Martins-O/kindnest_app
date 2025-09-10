require('dotenv').config();

async function testSendOTP() {
  try {
    console.log('🧪 Testing send OTP API...');
    
    const response = await fetch('http://localhost:5000/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@mailinator.com' }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers));

    const data = await response.json();
    console.log('📝 Response data:', data);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Start server in background and test
const express = require('express');
const server = require('./server');

setTimeout(() => {
  testSendOTP();
  setTimeout(() => process.exit(0), 2000);
}, 1000);