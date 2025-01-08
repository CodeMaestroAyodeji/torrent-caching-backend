// services/paymentProviders/PaystackProvider.js

const paystack = require('paystack-api');
const { PAYSTACK_SECRET_KEY } = process.env;

const paystackClient = paystack(PAYSTACK_SECRET_KEY);

class PaystackProvider {
  async initiatePayment(user, plan, currency, frontendUrl) {
    if (!user.email) {
      throw new Error('User email is required');
    }

    const paymentData = {
      email: user.email,
      amount: plan.prices[currency.toLowerCase()].amount * 100, // Convert to kobo
      currency: currency.toUpperCase(),
      callback_url: `${frontendUrl}/payment/success`,
      metadata: {
        userId: user._id.toString(),
        planId: plan._id.toString(),
        custom_fields: [
          {
            display_name: "Plan Name",
            variable_name: "plan_name",
            value: plan.name
          }
        ]
      }
    };

    try {
      const response = await paystackClient.transaction.initialize(paymentData);
      if (response.status) {
        return {
          paymentId: response.data.reference, // Use reference as paymentId
          url: response.data.authorization_url,
        };
      } else {
        throw new Error(response.message || 'Payment initiation failed');
      }
    } catch (error) {
      throw new Error(`Paystack payment initiation failed: ${error.message}`);
    }
  }

  async verifyPayment(paymentId) {
    try {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      const response = await paystackClient.transaction.verify({ reference: paymentId });
      if (response.status) {
        return {
          status: response.data.status,
          reference: response.data.reference,
          amount: response.data.amount / 100, // Convert from kobo back to main currency
          currency: response.data.currency
        };
      } else {
        throw new Error(response.message || 'Payment verification failed');
      }
    } catch (error) {
      throw new Error(`Paystack payment verification failed: ${error.message}`);
    }
  }
}

module.exports = new PaystackProvider();