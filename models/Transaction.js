// models/Transaction.js

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'NGN']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'flutterwave', 'paystack']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);