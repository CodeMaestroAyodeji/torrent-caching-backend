// routes/publicUserRoutes.js  
const express = require('express');  
const { allPlans } = require('../controllers/publicController'); // Ensure correct import  

const router = express.Router();  

router.get('/plan-list', allPlans); // Ensure this matches the exported function  

module.exports = router;