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
    const plan = await this.getPlanById(planId);
    
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
}

module.exports = new SubscriptionService();