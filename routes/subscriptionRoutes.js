// routes/subscriptionRoutes.js

const express = require('express');
const { 
  getPlans, 
  initiatePayment, 
  verifyPayment,
  getUserSubscription,
  getCurrentSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// router.get('/plans', getPlans);
router.post('/payment/initiate', protect, initiatePayment);
router.post('/payment/verify', protect, verifyPayment);
router.get('/user-subscription', protect, getUserSubscription);
router.get('/plans', protect, getPlans);
router.get('/current', protect, getCurrentSubscription);


module.exports = router;