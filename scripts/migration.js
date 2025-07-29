const mongoose = require('mongoose');
const { connectDB, logger } = require('./db-config');

/**
 * Database Migration Script for Speed Reading Platform
 * Creates indexes, collections, and initial data structure
 */

// Collection schemas
const collections = [
  {
    name: 'users',
    schema: {
      username: { type: String, required: true, unique: true, index: true },
      email: { type: String, required: true, unique: true, index: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
      isActive: { type: Boolean, default: true },
      profile: {
        avatar: String,
        bio: String,
        dateOfBirth: Date,
        phoneNumber: String,
        address: String
      },
      preferences: {
        language: { type: String, default: 'tr' },
        theme: { type: String, default: 'light' },
        notifications: { type: Boolean, default: true }
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      lastLoginAt: Date
    },
    indexes: [
      { email: 1 },
      { username: 1 },
      { 'profile.phoneNumber': 1 },
      { createdAt: -1 },
      { lastLoginAt: -1 }
    ]
  },
  
  {
    name: 'reading_texts',
    schema: {
      title: { type: String, required: true, index: true },
      content: { type: String, required: true },
      category: { type: String, required: true, index: true },
      difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
      wordCount: { type: Number, required: true },
      estimatedTime: Number, // in minutes
      language: { type: String, default: 'tr' },
      tags: [String],
      author: String,
      source: String,
      isActive: { type: Boolean, default: true },
      questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String
      }],
      metadata: {
        readingLevel: Number,
        complexity: Number,
        topicKeywords: [String]
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
    },
    indexes: [
      { title: 'text' },
      { category: 1, difficulty: 1 },
      { wordCount: 1 },
      { tags: 1 },
      { createdAt: -1 },
      { 'metadata.readingLevel': 1 }
    ]
  },
  
  {
    name: 'reading_sessions',
    schema: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
      textId: { type: mongoose.Schema.Types.ObjectId, ref: 'reading_texts', required: true },
      sessionData: {
        wordsPerMinute: Number,
        readingTime: Number, // in seconds
        comprehensionScore: Number, // percentage
        accuracy: Number, // percentage
        focusLevel: Number, // 1-10 scale
        eyeTrackingData: mongoose.Schema.Types.Mixed
      },
      answers: [{
        questionIndex: Number,
        userAnswer: Number,
        isCorrect: Boolean,
        timeSpent: Number // in seconds
      }],
      startTime: { type: Date, required: true },
      endTime: Date,
      isCompleted: { type: Boolean, default: false },
      deviceInfo: {
        userAgent: String,
        screenResolution: String,
        platform: String
      },
      createdAt: { type: Date, default: Date.now }
    },
    indexes: [
      { userId: 1, createdAt: -1 },
      { textId: 1 },
      { 'sessionData.wordsPerMinute': -1 },
      { 'sessionData.comprehensionScore': -1 },
      { startTime: -1 },
      { isCompleted: 1 }
    ]
  },
  
  {
    name: 'user_progress',
    schema: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, unique: true },
      statistics: {
        totalReadingSessions: { type: Number, default: 0 },
        totalReadingTime: { type: Number, default: 0 }, // in minutes
        averageWPM: { type: Number, default: 0 },
        averageComprehension: { type: Number, default: 0 },
        bestWPM: { type: Number, default: 0 },
        bestComprehension: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 }
      },
      goals: {
        targetWPM: Number,
        targetComprehension: Number,
        dailyReadingTime: Number, // in minutes
        weeklyReadingSessions: Number
      },
      achievements: [{
        id: String,
        name: String,
        description: String,
        unlockedAt: Date,
        iconUrl: String
      }],
      weeklyProgress: [{
        week: Date,
        sessionsCount: Number,
        readingTime: Number,
        averageWPM: Number,
        averageComprehension: Number
      }],
      lastUpdated: { type: Date, default: Date.now }
    },
    indexes: [
      { userId: 1 },
      { 'statistics.averageWPM': -1 },
      { 'statistics.averageComprehension': -1 },
      { lastUpdated: -1 }
    ]
  },
  
  {
    name: 'system_settings',
    schema: {
      key: { type: String, required: true, unique: true },
      value: mongoose.Schema.Types.Mixed,
      category: { type: String, required: true },
      description: String,
      isActive: { type: Boolean, default: true },
      updatedAt: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
    },
    indexes: [
      { key: 1 },
      { category: 1 },
      { updatedAt: -1 }
    ]
  }
];

/**
 * Create collections and indexes
 */
const createCollections = async () => {
  try {
    const db = mongoose.connection.db;
    
    for (const collection of collections) {
      logger.info(`Creating collection: ${collection.name}`);
      
      // Check if collection exists
      const exists = await db.listCollections({ name: collection.name }).hasNext();
      
      if (!exists) {
        await db.createCollection(collection.name);
        logger.info(`Collection ${collection.name} created`);
      } else {
        logger.info(`Collection ${collection.name} already exists`);
      }
      
      // Create indexes
      if (collection.indexes && collection.indexes.length > 0) {
        logger.info(`Creating indexes for ${collection.name}`);
        
        for (const index of collection.indexes) {
          try {
            await db.collection(collection.name).createIndex(index);
            logger.info(`Index created for ${collection.name}:`, index);
          } catch (indexError) {
            if (indexError.code === 85) {
              logger.warn(`Index already exists for ${collection.name}:`, index);
            } else {
              logger.error(`Error creating index for ${collection.name}:`, indexError);
            }
          }
        }
      }
    }
    
    logger.info('All collections and indexes created successfully');
    
  } catch (error) {
    logger.error('Error creating collections:', error);
    throw error;
  }
};

/**
 * Insert default system settings
 */
const insertDefaultSettings = async () => {
  try {
    const db = mongoose.connection.db;
    const settingsCollection = db.collection('system_settings');
    
    const defaultSettings = [
      {
        key: 'app_version',
        value: '1.0.0',
        category: 'system',
        description: 'Application version'
      },
      {
        key: 'maintenance_mode',
        value: false,
        category: 'system',
        description: 'Maintenance mode status'
      },
      {
        key: 'registration_enabled',
        value: true,
        category: 'user',
        description: 'User registration enabled'
      },
      {
        key: 'max_file_upload_size',
        value: 5242880, // 5MB
        category: 'upload',
        description: 'Maximum file upload size in bytes'
      },
      {
        key: 'session_timeout',
        value: 3600000, // 1 hour
        category: 'security',
        description: 'Session timeout in milliseconds'
      },
      {
        key: 'rate_limit_window',
        value: 900000, // 15 minutes
        category: 'security',
        description: 'Rate limit window in milliseconds'
      },
      {
        key: 'rate_limit_max_requests',
        value: 100,
        category: 'security',
        description: 'Maximum requests per rate limit window'
      }
    ];
    
    for (const setting of defaultSettings) {
      const exists = await settingsCollection.findOne({ key: setting.key });
      
      if (!exists) {
        await settingsCollection.insertOne({
          ...setting,
          isActive: true,
          updatedAt: new Date()
        });
        logger.info(`Default setting inserted: ${setting.key}`);
      } else {
        logger.info(`Setting already exists: ${setting.key}`);
      }
    }
    
    logger.info('Default settings inserted successfully');
    
  } catch (error) {
    logger.error('Error inserting default settings:', error);
    throw error;
  }
};

/**
 * Run migration
 */
const runMigration = async () => {
  try {
    logger.info('Starting database migration...');
    
    // Connect to database
    await connectDB();
    
    // Create collections and indexes
    await createCollections();
    
    // Insert default settings
    await insertDefaultSettings();
    
    logger.info('Database migration completed successfully');
    
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  collections,
  createCollections,
  insertDefaultSettings,
  runMigration
};