// routes/publicUrl.js

const express = require('express');
const { getPlans } = require('../controllers/publicController');

const router = express.Router();


router.get('/plan-list', getPlans);

module.exports = router;
