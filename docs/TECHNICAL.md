# Speed Reading Platform - Technical Documentation

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React SPA)   │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │   (Express)     │    │   (Atlas)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     CDN         │    │   Monitoring    │    │     Backup      │
│   (Static)      │    │   (PM2/Logs)    │    │   (Automated)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **React 18+**: Modern UI library
- **Webpack 5**: Module bundler and build tool
- **Babel**: JavaScript transpiler
- **CSS3**: Styling with custom properties
- **Service Worker**: PWA capabilities

#### Backend
- **Node.js 18+**: Runtime environment
- **Express.js**: Web framework
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Helmet**: Security headers
- **Winston**: Logging

#### Database
- **MongoDB Atlas**: Cloud database
- **Connection Pooling**: Optimized connections
- **Indexing Strategy**: Performance optimization

#### Security
- **HTTPS**: TLS encryption
- **CORS**: Cross-origin control
- **Rate Limiting**: DDoS protection
- **Input Validation**: XSS/SQL injection prevention
- **CSP**: Content Security Policy

#### Deployment
- **PM2**: Process management
- **Docker**: Containerization (optional)
- **cPanel**: Hosting environment
- **Apache**: Web server with .htaccess

## 📁 Project Structure

```
speed-reading-platform/
├── config/                 # Configuration files
│   ├── .htaccess           # Apache configuration
│   ├── apache.conf         # Virtual host example
│   └── db-config.js        # Database configuration
├── middleware/             # Express middleware
│   ├── security.js         # Security middleware
│   └── cors.js             # CORS configuration
├── scripts/                # Deployment scripts
│   ├── build.sh            # Production build
│   ├── deploy.sh           # Deployment script
│   ├── backup.sh           # Backup automation
│   ├── migration.js        # Database migrations
│   └── seed.js             # Sample data seeder
├── src/                    # Frontend source
│   ├── index.js            # Main React entry
│   └── index.css           # Global styles
├── public/                 # Public assets
│   └── index.html          # HTML template
├── docs/                   # Documentation
├── logs/                   # Application logs
├── uploads/                # User uploads
├── dist/                   # Build output
├── .env.production         # Production environment
├── package.json            # Dependencies
├── server.js               # Main server file
├── ecosystem.config.js     # PM2 configuration
├── webpack.config.prod.js  # Production webpack
├── Dockerfile              # Docker configuration
└── docker-compose.yml      # Docker compose
```

## 🔧 Configuration Details

### Environment Variables

#### Production Environment (`.env.production`)
```bash
# Application
NODE_ENV=production
PORT=3000
DOMAIN=yourdomain.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
DB_NAME=speedreading_prod
DB_MAX_POOL_SIZE=10
DB_CONNECTION_TIMEOUT=30000

# Security
JWT_SECRET=your-super-secure-secret
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/public/uploads

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/speedreading/app.log

# Performance
COMPRESSION_LEVEL=6
STATIC_CACHE_MAX_AGE=31536000
```

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (enum: admin, teacher, student),
  isActive: Boolean,
  profile: {
    avatar: String,
    bio: String,
    dateOfBirth: Date,
    phoneNumber: String,
    address: String
  },
  preferences: {
    language: String (default: 'tr'),
    theme: String (default: 'light'),
    notifications: Boolean (default: true)
  },
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

#### Reading Texts Collection
```javascript
{
  _id: ObjectId,
  title: String (indexed),
  content: String,
  category: String (indexed),
  difficulty: String (enum: beginner, intermediate, advanced),
  wordCount: Number,
  estimatedTime: Number, // minutes
  language: String (default: 'tr'),
  tags: [String] (indexed),
  author: String,
  source: String,
  isActive: Boolean,
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
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (ref: users)
}
```

#### Reading Sessions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, indexed),
  textId: ObjectId (ref: reading_texts),
  sessionData: {
    wordsPerMinute: Number,
    readingTime: Number, // seconds
    comprehensionScore: Number, // percentage
    accuracy: Number, // percentage
    focusLevel: Number, // 1-10 scale
    eyeTrackingData: Mixed
  },
  answers: [{
    questionIndex: Number,
    userAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number // seconds
  }],
  startTime: Date,
  endTime: Date,
  isCompleted: Boolean,
  deviceInfo: {
    userAgent: String,
    screenResolution: String,
    platform: String
  },
  createdAt: Date
}
```

### Security Configuration

#### Helmet Security Headers
```javascript
{
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.yourdomain.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'sameorigin' },
  noSniff: true,
  xssFilter: true
}
```

#### Rate Limiting
```javascript
{
  // General API rate limit
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  
  // Auth endpoints
  windowMs: 15 * 60 * 1000,
  max: 5, // more restrictive
  
  // Password reset
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3 // very restrictive
}
```

## 🚀 Deployment Strategies

### 1. Traditional cPanel Deployment
- Manual file upload via File Manager
- Node.js app configuration through cPanel
- Environment variables through cPanel interface
- SSL certificate via Let's Encrypt

### 2. CI/CD Pipeline (Advanced)
```yaml
# Example GitHub Actions workflow
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Deploy to server
        run: ./scripts/deploy.sh
```

### 3. Docker Deployment
```bash
# Build and run with Docker
docker build -t speed-reading-app .
docker run -d -p 3000:3000 --env-file .env.production speed-reading-app

# Or with docker-compose
docker-compose up -d
```

## 📊 Monitoring and Analytics

### Application Monitoring
- **PM2 Monitoring**: Process health, memory usage, CPU usage
- **Custom Health Checks**: Database connectivity, API responsiveness
- **Log Analysis**: Error rates, performance metrics

### Performance Metrics
```javascript
// Health check endpoint response
{
  status: 'ok',
  timestamp: '2024-01-01T12:00:00.000Z',
  uptime: 3600, // seconds
  environment: 'production',
  version: '1.0.0',
  database: {
    status: 'healthy',
    state: 'connected',
    ping: true
  },
  memory: {
    used: 256, // MB
    total: 512, // MB
    external: 45 // MB
  }
}
```

### Log Management
```javascript
// Winston logger configuration
{
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
}
```

## 🔄 Backup and Recovery

### Automated Backup Strategy
- **Daily Database Backup**: MongoDB collections
- **Weekly File Backup**: Application files and uploads
- **Monthly Full Backup**: Complete system snapshot
- **Retention Policy**: 30 days for daily, 12 weeks for weekly

### Recovery Procedures
1. **Database Recovery**: Restore from MongoDB dump
2. **File Recovery**: Extract from backup archive
3. **Configuration Recovery**: Restore environment variables
4. **Full System Recovery**: Complete restoration process

## 🔧 Maintenance Tasks

### Daily Tasks
- Monitor application logs
- Check system resources
- Verify backup completion
- Review security alerts

### Weekly Tasks
- Update dependencies (if needed)
- Analyze performance metrics
- Clean old log files
- Database maintenance

### Monthly Tasks
- Security audit
- Performance optimization
- Backup verification
- Documentation updates

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### High Memory Usage
```bash
# Check PM2 status
pm2 status

# Restart with memory limit
pm2 restart all --max-memory-restart 512M

# Monitor memory usage
pm2 monit
```

#### Database Connection Issues
```bash
# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error('Connection failed:', err));
"
```

#### SSL Certificate Problems
```bash
# Check certificate validity
openssl x509 -in /path/to/cert.pem -text -noout

# Verify certificate chain
openssl verify -CAfile /path/to/ca-bundle.crt /path/to/cert.pem
```

This documentation provides a comprehensive technical overview of the Speed Reading Platform, covering architecture, configuration, deployment, and maintenance aspects.