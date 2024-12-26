const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeProvider {
  async initiatePayment(user, plan, currency, frontendUrl) {
    try {
      if (!plan.prices || !plan.prices[currency.toLowerCase()]) {
        throw new Error('Invalid price data for Stripe payment');
      }

      const amount = plan.prices[currency.toLowerCase()].amount;
      const formattedAmount = Math.round(amount * 100);

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${plan.name} Subscription`,
            },
            unit_amount: formattedAmount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/payment/cancel`,
        metadata: {
          userId: user._id.toString(),
          planId: plan._id.toString()
        }
      });

      return {
        paymentId: session.id,
        url: session.url
      };
    } catch (error) {
      throw new Error(`Stripe payment initiation failed: ${error.message}`);
    }
  }

  async verifyPayment(paymentId) {
    return await stripe.checkout.sessions.retrieve(paymentId);
  }
}

module.exports = new StripeProvider();