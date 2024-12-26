// services/paymentService.js

const StripeProvider = require('./paymentProviders/StripeProvider');  
const PayPalProvider = require('./paymentProviders/PayPalProvider');  
const FlutterwaveProvider = require('./paymentProviders/FlutterwaveProvider');    
const PaystackProvider = require('./paymentProviders/PaystackProvider');  

class PaymentService {  
  constructor() {  
    const requiredEnvVars = ['FRONTEND_DEV_URL'];  
    
    for (const envVar of requiredEnvVars) {  
      if (!process.env[envVar]) {  
        throw new Error(`${envVar} environment variable is not set`);  
      }  
    }  

    this.frontendUrl = process.env.FRONTEND_DEV_URL.replace(/\/$/, '');  
  }  

  async initiatePayment(user, plan, currency, gateway) {  
    try {  
      switch (gateway.toLowerCase()) {  
        case 'stripe':  
          return await StripeProvider.initiatePayment(user, plan, currency, this.frontendUrl);  
        case 'paypal':  
          return await PayPalProvider.initiatePayment(user, plan, currency);  
        case 'flutterwave':  
          return await FlutterwaveProvider.initiatePayment(user, plan, currency, this.frontendUrl);  
        case 'paystack':  
          return await PaystackProvider.initiatePayment(user, plan, currency, this.frontendUrl);  
        default:  
          throw new Error('Invalid payment gateway');  
      }  
    } catch (error) {  
      throw new Error(`${gateway} payment initiation failed: ${error.message}`);  
    }  
  }  

  async verifyPayment(paymentId, gateway) {  
    try {  
      switch (gateway.toLowerCase()) {  
        case 'stripe':  
          return await StripeProvider.verifyPayment(paymentId);  
        case 'paypal':  
          return await PayPalProvider.verifyPayment(paymentId);  
        case 'flutterwave':  
          return await FlutterwaveProvider.verifyPayment(paymentId);  
        case 'paystack':  
          return await PaystackProvider.verifyPayment(paymentId);  
        default:  
          throw new Error('Invalid payment gateway');  
      }  
    } catch (error) {  
      throw new Error(`Payment verification failed: ${error.message}`);  
    }  
  }  
}  

module.exports = new PaymentService();