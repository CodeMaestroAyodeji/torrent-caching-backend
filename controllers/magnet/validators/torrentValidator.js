// const { body, validationResult } = require('express-validator');  
import { body, validationResult } from 'express-validator';

exports.validateTorrent = [  
  body('magnetLink')  
    .notEmpty().withMessage('Magnet link is required.')  
    .isString().withMessage('Magnet link must be a string.')  
    .matches(/^magnet:\?xt=urn:btih:[a-f0-9]{40}$/i).withMessage('Valid magnet link is required.'),  
];  

exports.handleValidationErrors = (req, res, next) => {  
  const errors = validationResult(req);  
  if (!errors.isEmpty()) {  
    return res.status(400).json({ errors: errors.array() });  
  }  
  next();  
};