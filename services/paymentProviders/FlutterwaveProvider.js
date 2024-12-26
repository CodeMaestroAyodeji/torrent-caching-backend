// services/paymentProviders/FlutterwaveProvider.js

const Flutterwave = require('flutterwave-node-v3');
const { FLUTTERWAVE_PUBLIC_KEY, FLUTTERWAVE_SECRET_KEY } = process.env;

const flw = new Flutterwave(FLUTTERWAVE_PUBLIC_KEY, FLUTTERWAVE_SECRET_KEY);

class FlutterwaveProvider {
  async initiatePayment(user, plan, currency, frontendUrl) {
    const paymentData = {
      tx_ref: `txn_${Date.now()}`,
      amount: plan.prices[currency.toLowerCase()].amount,
      currency: currency.toUpperCase(),
      payment_options: 'card',
      redirect_url: `${frontendUrl}/payment/success`,
      customer: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phonenumber: user.phone || ''
      },
      customizations: {
        title: `${plan.name} Subscription`,
        description: `Payment for ${plan.name} plan`,
        logo: 'https://your-logo-url.com'
      },
      meta: {
        userId: user._id.toString(),
        planId: plan._id.toString()
      }
    };

    try {
      const response = await flw.Charge.initialize(paymentData);
      
      if (response && response.status === 'success') {
        return {
          paymentId: response.data.id,
          url: response.data.link,
          reference: response.data.flw_ref
        };
      } else {
        throw new Error(response?.message || 'Payment initiation failed');
      }
    } catch (error) {
      throw new Error(`Flutterwave payment initiation failed: ${error.message}`);
    }
  }

  async verifyPayment(paymentId) {
    try {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      const response = await flw.Transaction.verify({ id: paymentId });
      if (response.status === 'success') {
        return {
          status: response.data.status,
          reference: response.data.flw_ref,
          amount: response.data.amount,
          currency: response.data.currency
        };
      } else {
        throw new Error(response.message || 'Payment verification failed');
      }
    } catch (error) {
      throw new Error(`Flutterwave payment verification failed: ${error.message}`);
    }
  }
}

module.exports = new FlutterwaveProvider();