// controllers/subscriptionController.js

const User = require('../models/User');
const { SubscriptionPlan } = require("../models/SubscriptionPlan");
const PaymentService = require('../services/paymentService');
const Transaction = require('../models/Transaction');

exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionService.getActivePlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
};

exports.initiatePayment = async (req, res) => {
  try {
    const { planId, gateway, currency, cardDetails } = req.body;
    const user = req.user;

    if (!planId || !gateway || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const plan = await SubscriptionService.getPlanById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    let paymentResponse;
    try {
      paymentResponse = await PaymentService.initiatePayment(
        user,
        plan,
        currency,
        gateway,
        cardDetails // Pass card details for Flutterwave
      );
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      user: user._id,
      plan: plan._id,
      amount: plan.prices[currency.toLowerCase()].amount,
      currency: currency,
      paymentMethod: gateway,
      paymentId: paymentResponse.paymentId,
      status: 'pending'
    });

    res.json({
      ...paymentResponse,
      transactionId: transaction._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, gateway } = req.body;
    
    const transaction = await Transaction.findOne({ paymentId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const verificationResult = await PaymentService.verifyPayment(paymentId, gateway);
    
    if (verificationResult.status === 'successful' || verificationResult.status === 'completed') {
      // Update transaction status
      transaction.status = 'completed';
      await transaction.save();

      // Update user subscription
      const plan = await SubscriptionService.getPlanById(transaction.plan);
      const expiryDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
      await SubscriptionService.updateUserSubscription(transaction.user, transaction.plan, expiryDate);

      return res.json({ message: 'Payment verified successfully' });
    }

    res.status(400).json({ error: 'Payment verification failed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription subscriptionExpiry');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription details' });
  }
};


exports.getPlans = async (req, res) => {
  try {
      const plans = await SubscriptionPlan.find();
      res.json(plans);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

exports.getCurrentSubscription = async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Get the user's current subscription plan details
      const currentPlan = await SubscriptionPlan.findOne({ name: user.subscription });
      
      if (!currentPlan) {
          return res.json(null);
      }

      const userSubscription = {
          ...currentPlan.toObject(),
          expiryDate: user.subscriptionExpiry
      };

      res.json(userSubscription);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
