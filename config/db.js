// config/db.js

const mongoose = require('mongoose');  

const connectDB = async () => {  
  try {  
    // Connect to MongoDB without deprecated options  
    await mongoose.connect(process.env.MONGO_URI);  
    console.log('MongoDB connected successfully');  
  } catch (error) {  
    console.error('Error connecting to MongoDB:', error);  
    process.exit(1); // Exit the process with failure  
  }  
};  

module.exports = connectDB;