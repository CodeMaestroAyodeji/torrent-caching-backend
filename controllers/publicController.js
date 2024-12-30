// controllers/publicController.js  
const { SubscriptionPlan } = require('../models/SubscriptionPlan'); // Adjust this path if necessary  

exports.allPlans = async (req, res) => { // Change this line  
  try {  
    const plans = await SubscriptionPlan.find();  
    res.json(plans);  
  } catch (error) {  
    console.error('Error fetching plans:', error); // Log the error for debugging  
    res.status(500).json({ error: error.message });  
  }  
};