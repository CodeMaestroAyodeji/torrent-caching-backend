// scripts/createTestPlan.js

const mongoose = require('mongoose');
const SubscriptionPlan = require('../models/SubscriptionPlan');

async function createTestPlan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const premiumPlan = {
      name: 'premium',
      prices: {
        usd: { amount: 9.99 },
        ngn: { amount: 4500 }
      },
      duration: 30,
      limits: {
        downloads: 100,
        speed: 100,
        storage: 50
      },
      features: ['Unlimited Downloads', 'Priority Support'],
      isActive: true
    };

    const plan = await SubscriptionPlan.create(premiumPlan);
    console.log('Test plan created:', plan);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test plan:', error);
  }
}

createTestPlan();