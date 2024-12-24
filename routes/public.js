// routes/public

// const express = require('express');
// const { getPlans } = require('../controllers/publicController');

import express from 'express';
import { getPlans } from '../controllers/publicController.js';

const router = express.Router();


router.get('/plan-list', getPlans);

module.exports = router;
