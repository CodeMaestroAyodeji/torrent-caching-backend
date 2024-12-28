// services/SubscriptionService.js

const SubscriptionPlan = require('../models/SubscriptionPlan');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

class SubscriptionService {
  async getActivePlans() {
    return await SubscriptionPlan.find({ isActive: true });
  }

  async getPlanById(planId) {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }
    return plan;
  }

  async createPlan(planData) {
    try {
      const plan = new SubscriptionPlan(planData);
      await plan.validate(); // Validate before saving
      return await plan.save();
    } catch (error) {
      throw new Error(`Failed to create plan: ${error.message}`);
    }
  }

  async updateUserSubscription(userId, planId, expiryDate) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }
    
    user.subscription = plan.name;
    user.subscriptionExpiry = expiryDate;
    await user.save();
    
    return user;
  }

  async createDefaultPlans() {
    const plans = require('../models/Plans');
    try {
      const results = await Promise.all(
        plans.map(plan => this.createPlan(plan))
      );
      return results;
    } catch (error) {
      throw new Error(`Failed to create default plans: ${error.message}`);
    }
  }

  async getCurrentSubscription(userId) {
    const user = await User.findById(userId).select('subscription subscriptionExpiry');
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.subscription) {
      return null;
    }

    const plan = await SubscriptionPlan.findOne({ name: user.subscription });
    return {
      ...plan.toObject(),
      expiryDate: user.subscriptionExpiry
    };
  }
}

module.exports = new SubscriptionService();