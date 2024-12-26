// models/Plans.js

const plans = [
    {
      name: 'free',
      prices: {
        usd: { amount: 0, currency: 'USD' },
        ngn: { amount: 0, currency: 'NGN' }
      },
      duration: 30,
      limits: {
        downloads: 5,
        speed: 1,
        storage: 1
      },
      features: ['Basic downloads', 'Limited storage']
    },
    {
      name: 'premium',
      prices: {
        usd: { amount: 9.99, currency: 'USD' },
        ngn: { amount: 4500, currency: 'NGN' }
      },
      duration: 30,
      limits: {
        downloads: 50,
        speed: 10,
        storage: 50
      },
      features: ['Faster downloads', 'More storage', 'Priority support']
    },
    {
      name: 'unlimited',
      prices: {
        usd: { amount: 19.99, currency: 'USD' },
        ngn: { amount: 9000, currency: 'NGN' }
      },
      duration: 30,
      limits: {
        downloads: -1,
        speed: -1,
        storage: 100
      },
      features: ['Unlimited downloads', 'Maximum speed', 'Premium support']
    }
  ];
  