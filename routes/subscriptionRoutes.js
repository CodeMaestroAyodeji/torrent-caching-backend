// routes/subscriptionRoutes.js

const express = require('express');
const { 
  getPlans, 
  initiatePayment, 
  verifyPayment,
  getUserSubscription
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/plans', getPlans);
router.post('/payment/initiate', protect, initiatePayment);
router.post('/payment/verify', protect, verifyPayment);
router.get('/user-subscription', protect, getUserSubscription);

module.exports = router;