const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Import configurations and middleware
const { connectDB, checkDatabaseHealth } = require('./config/db-config');
const { helmetConfig, apiRateLimit, requestLogger, errorHandler } = require('./middleware/security');
const { conditionalCors } = require('./middleware/cors');

/**
 * Speed Reading Platform Server
 * Production-ready Express.js application
 */

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy (important for production behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);

// CORS middleware
app.use(conditionalCors);

// Request logging
app.use(requestLogger);

// Compression middleware
app.use(compression({
  level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Rate limiting for API routes
app.use('/api', apiRateLimit);

// Static file serving
app.use('/static', express.static(path.join(__dirname, 'dist/static'), {
  maxAge: NODE_ENV === 'production' ? '1y' : '1d',
  etag: true,
  lastModified: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '30d',
  etag: true
}));

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      database: dbHealth,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      cpu: process.cpuUsage()
    };
    
    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * API Status endpoint
 */
app.get('/api/v1/status', (req, res) => {
  res.json({
    api: 'Speed Reading Platform API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

/**
 * API Routes would go here
 */
app.use('/api/v1/auth', (req, res) => {
  res.json({ message: 'Auth API endpoint - implement authentication routes here' });
});

app.use('/api/v1/users', (req, res) => {
  res.json({ message: 'Users API endpoint - implement user management routes here' });
});

app.use('/api/v1/texts', (req, res) => {
  res.json({ message: 'Texts API endpoint - implement reading texts routes here' });
});

app.use('/api/v1/sessions', (req, res) => {
  res.json({ message: 'Sessions API endpoint - implement reading sessions routes here' });
});

/**
 * Serve React app (Single Page Application)
 */
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false, 
      message: 'API endpoint not found' 
    });
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global error handler
app.use(errorHandler);

/**
 * Start server
 */
const startServer = async () => {
  try {
    console.log('🚀 Starting Speed Reading Platform...');
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Node.js Version: ${process.version}`);
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Application URL: http://localhost:${PORT}`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
      console.log(`📡 API Status: http://localhost:${PORT}/api/v1/status`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        
        mongoose.connection.close(false, () => {
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        });
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.log('⚠️  Forcefully shutting down...');
        process.exit(1);
      }, 30000);
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('💥 Uncaught Exception:', err);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;