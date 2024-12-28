// utils/priceFormatters.js

/**
 * Formats price amount for payment gateways
 * @param {number} amount - The price amount
 * @param {string} gateway - The payment gateway
 * @returns {number} Formatted price amount
 */
exports.formatPriceForGateway = (amount, gateway) => {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
    throw new Error('Invalid amount provided');
  }

  switch (gateway.toLowerCase()) {
    case 'stripe':
    case 'paystack':
      return Math.round(amount * 100);
    case 'paypal':
    case 'flutterwave':
      return Number(amount.toFixed(2));
    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
};

exports.validatePriceData = (prices, currency) => {
  if (!prices) {
    throw new Error('Prices object is required');
  }

  const normalizedCurrency = currency.toLowerCase();
  
  if (!prices[normalizedCurrency] || typeof prices[normalizedCurrency].amount !== 'number') {
    throw new Error(`Price not found for currency: ${currency}`);
  }

  return {
    amount: prices[normalizedCurrency].amount,
    currency: currency.toUpperCase()
  };
};