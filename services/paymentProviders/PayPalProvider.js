// services/paymentProviders/PayPalProvider.js

const paypal = require('@paypal/checkout-server-sdk');

class PayPalProvider {
  constructor() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials are not configured');
    }

    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async initiatePayment(user, plan, currency) {
    try {
      if (!plan.prices || !plan.prices[currency.toLowerCase()]) {
        throw new Error('Invalid price data for PayPal payment');
      }

      const amount = plan.prices[currency.toLowerCase()].amount;
      const request = new paypal.orders.OrdersCreateRequest();
      
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toString()
          },
          description: `${plan.name} Subscription`
        }],
        application_context: {
          user_id: user._id.toString(),
          brand_name: 'Your App Name',
          return_url: `${process.env.FRONTEND_DEV_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_DEV_URL}/payment/cancel`
        }
      });

      const order = await this.client.execute(request);
      
      return {
        paymentId: order.result.id,
        url: order.result.links.find(link => link.rel === 'approve').href
      };
    } catch (error) {
      throw new Error(`PayPal payment initiation failed: ${error.message}`);
    }
  }

  async verifyPayment(paymentId) {
    try {
      const request = new paypal.orders.OrdersGetRequest(paymentId);
      const order = await this.client.execute(request);
      return order.result;
    } catch (error) {
      throw new Error(`PayPal payment verification failed: ${error.message}`);
    }
  }
}

module.exports = new PayPalProvider();