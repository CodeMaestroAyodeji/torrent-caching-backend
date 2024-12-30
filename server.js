// server.js  

const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
// const { corsMiddleware, handlePreflight } = require('./middleware/cors');
const corsOptions = require('./config/corsOptions');
const cors = require('cors');
// const environment = require('./config/allowedOrigins');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const { initializeWebSocket } = require('./websocket/websocketServer');
const WebSocketManager = require('./services/webSocketManager');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const torrentRoutes = require('./routes/torrent');
const adminRoutes = require('./routes/admin');
const userProfileRoutes = require('./routes/userProfile');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paypalRoutes = require('./routes/paypal');
const paystackRoutes = require('./routes/paystack');
const flutterwaveRoutes = require('./routes/flutterwave');
const publicUrl = require('./routes/publicRoutes');

// console.log('Environment:', environment.NODE_ENV);
// console.log('Frontend URL:', environment.getCurrentFrontendUrl());

// Load environment variables
dotenv.config();

// Check if NODE_ENV is defined
if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV not defined');
}

// Connect to the database
connectDB()
  .then(() => {
    const app = express();
    const server = http.createServer(app);
    
    // Apply CORS middleware  
    app.use(cors(corsOptions));

    
    // Other middleware
    app.use(express.json());
    app.use(logger);
    
    // Test route
    app.get('/', (req, res) => {
      res.json({ 
        message: 'API is running...',
        environment: environment.NODE_ENV,
        frontendUrl: environment.getCurrentFrontendUrl()
      });
    });


    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/torrents', torrentRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/subscriptions', subscriptionRoutes);
    app.use('/api/paypal', paypalRoutes);
    app.use('/api/paystack', paystackRoutes);
    app.use('/api/flutterwave', flutterwaveRoutes);
    app.use('/api/users/', userProfileRoutes);
    app.use('/api', publicUrl);

    // Error handling middleware
    app.use(errorHandler);

    // Initialize WebSocket server    
    WebSocketManager.initialize(server);
    initializeWebSocket(server);

    server.listen(process.env.PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  });