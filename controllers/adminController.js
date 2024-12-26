// controllers/adminController.js

const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const Torrent = require('../models/Torrent');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user status (block/unblock)
exports.updateUserStatus = async (req, res) => {  
  const { userId, action } = req.body;  

  // Validate action  
  if (!['block', 'unblock'].includes(action)) {  
    return res.status(400).json({ message: 'Invalid action specified' });  
  }  

  try {  
    const user = await User.findById(userId);  
    if (!user) {  
      return res.status(404).json({ message: 'User not found' });  
    }  

    user.isBlocked = (action === 'block');  
    await user.save();  

    res.json({ message: `User ${action}ed successfully.` });  
  } catch (error) {  
    console.error(error); // Log detailed error   
    res.status(500).json({ error: error.message });  
  }  
}; 

// Delete user  
exports.deleteUser = async (req, res) => {  
  const { userId } = req.body;  

  try {  
    const user = await User.findById(userId);  
    if (!user) {  
      return res.status(404).json({ message: 'User not found.' });  // Check if user exists  
    }  

    await User.findByIdAndDelete(userId);  
    res.json({ message: 'User deleted successfully.' });  
  } catch (error) {  
    console.error(error); // Log error for debugging  
    res.status(500).json({ error: error.message });  
  }  
};

// Get all subscription plans from User schema
// exports.getAllPlans = async (req, res) => {  
//   try {  
//     const users = await User.find({}, 'subscription');
//     const plans = users.map(user => user.subscription).filter(Boolean);
//     res.json(plans);  
//   } catch (error) {  
//     res.status(500).json({ error: error.message });  
//   }  
// };

exports.getAllPlans = async (req, res) => {  
  try {  
    const plans = await SubscriptionPlan.find({});   
    res.json(plans);  
  } catch (error) {  
    res.status(500).json({ error: error.message });  
  }  
};

// Update subscription plan
exports.updatePlan = async (req, res) => {
  const { planId, updates } = req.body;

  try {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    Object.assign(plan, updates);
    await plan.save();

    res.json({ message: 'Plan updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new subscription plan
exports.createPlan = async (req, res) => {
  try {
    const { name, prices, duration, limits, features, isActive } = req.body;

    // Validate required fields
    if (!name || !prices || !limits) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate prices structure
    if (!prices.usd || !prices.ngn || 
        typeof prices.usd.amount !== 'number' || 
        typeof prices.ngn.amount !== 'number') {
      return res.status(400).json({ error: 'Invalid price structure' });
    }

    // Create new plan
    const newPlan = new SubscriptionPlan({
      name,
      prices,
      duration: duration || 30,
      limits,
      features: features || [],
      isActive: isActive ?? true
    });

    await newPlan.save();

    res.status(201).json({
      message: 'Plan created successfully',
      plan: newPlan
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Plan with this name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete subscription plan
exports.deletePlan = async (req, res) => {
  const { planId } = req.body;

  try {
    await SubscriptionPlan.findByIdAndDelete(planId);
    res.json({ message: 'Plan deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get basic analytics  
exports.getAnalytics = async (req, res) => {  
  try {  
    const totalUsers = await User.countDocuments();  
    const premiumUsers = await User.countDocuments({ subscription: 'premium' });  
    const freeUsers = await User.countDocuments({ subscription: 'free' });  
    const totalTorrents = await Torrent.countDocuments();  
    const totalStorageUsed = await Torrent.aggregate([{ $group: { _id: null, totalSize: { $sum: '$size' } } }]);  
    const totalDownloads = await Torrent.countDocuments({ status: 'completed' });  
    const totalActiveSubscriptions = await User.countDocuments({ subscription: { $ne: 'free' } });  

    res.json({  
      totalUsers,  
      premiumUsers,  
      freeUsers,  
      totalTorrents,  
      storageUsed: totalStorageUsed[0]?.totalSize || 0,  
      totalDownloads,  
      totalActiveSubscriptions,  
    });  
  } catch (error) {  
    res.status(500).json({ error: error.message });  
  }  
};