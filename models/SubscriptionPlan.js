// models/SubscriptionPlan.js

const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  }
});

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['free', 'premium', 'unlimited']
  },
  prices: {
    usd: priceSchema,
    ngn: priceSchema
  },
  duration: {
    type: Number,
    required: true,
    default: 30 // Duration in days
  },
  limits: {
    downloads: {
      type: Number,
      required: true,
      default: 0
    },
    speed: {
      type: Number,
      required: true,
      default: 0
    },
    storage: {
      type: Number,
      required: true,
      default: 0
    }
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);

module.exports = {
  SubscriptionPlan
};