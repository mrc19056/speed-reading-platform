const mongoose = require('mongoose');
const winston = require('winston');

/**
 * Database Configuration for Speed Reading Platform
 * Production optimized MongoDB connection with Atlas
 */

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/db-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/db-combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

/**
 * Database connection configuration
 */
const dbConfig = {
  // MongoDB Atlas Connection String
  uri: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/speedreading?retryWrites=true&w=majority',
  
  // Database name
  dbName: process.env.DB_NAME || 'speedreading_prod',
  
  // Connection options for production
  options: {
    // Connection pool settings
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
    socketTimeoutMS: 45000,
    
    // Replica set options
    retryWrites: true,
    w: 'majority',
    readPreference: 'primary',
    
    // Compression
    compressors: ['zlib'],
    
    // Authentication
    authSource: 'admin',
    
    // TLS/SSL
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    
    // Other options
    bufferMaxEntries: 0,
    bufferCommands: false,
    family: 4, // Use IPv4
  }
};

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info(`MongoDB connected to ${dbConfig.dbName}`);
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful close on process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    // Connect to MongoDB
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    
    logger.info('MongoDB connection established successfully');
    
    // Set global mongoose options
    mongoose.set('strictQuery', true);
    mongoose.set('strictPopulate', false);
    
    return mongoose.connection;
    
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    
    // Retry connection after delay
    setTimeout(() => {
      logger.info('Retrying MongoDB connection...');
      connectDB();
    }, 5000);
    
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Check database connection health
 */
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (state === 1) {
      // Test with a simple operation
      const admin = mongoose.connection.db.admin();
      const result = await admin.ping();
      
      return {
        status: 'healthy',
        state: states[state],
        database: dbConfig.dbName,
        ping: result.ok === 1,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        status: 'unhealthy',
        state: states[state],
        database: dbConfig.dbName,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get database statistics
 */
const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    return {
      database: stats.db,
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      collectionsInfo: collections.map(col => ({
        name: col.name,
        type: col.type
      }))
    };
  } catch (error) {
    logger.error('Error getting database stats:', error);
    throw error;
  }
};

/**
 * Database backup configuration
 */
const backupConfig = {
  // Backup schedule (cron format)
  schedule: '0 2 * * *', // Daily at 2 AM
  
  // Backup retention period (days)
  retention: 30,
  
  // Collections to backup (empty array means all collections)
  collections: [],
  
  // Backup location
  path: process.env.BACKUP_PATH || '/backups/mongodb',
  
  // Compression
  compress: true
};

module.exports = {
  dbConfig,
  connectDB,
  disconnectDB,
  checkDatabaseHealth,
  getDatabaseStats,
  backupConfig,
  logger
};