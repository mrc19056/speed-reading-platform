const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

/**
 * Security Middleware for Speed Reading Platform
 * Production-ready security configurations
 */

/**
 * Helmet configuration for security headers
 */
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // React development
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://api.yourdomain.com",
        "wss://yourdomain.com"
      ],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    },
    reportOnly: false
  },
  
  // Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'sameorigin'
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-XSS-Protection
  xssFilter: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },
  
  // Don't infer MIME type
  ieNoOpen: true,
  
  // Permissions Policy
  permissionsPolicy: {
    features: {
      geolocation: ['self'],
      microphone: [],
      camera: [],
      fullscreen: ['self'],
      payment: [],
      accelerometer: [],
      gyroscope: [],
      magnetometer: [],
      usb: []
    }
  }
});

/**
 * Rate limiting configurations
 */
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    }
  });
};

// General API rate limit
const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many API requests, please try again later.'
);

// Strict rate limit for authentication endpoints
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.',
  true // skip successful requests
);

// Very strict rate limit for password reset
const passwordResetRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // limit each IP to 3 requests per hour
  'Too many password reset attempts, please try again later.'
);

// File upload rate limit
const uploadRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 uploads per minute
  'Too many file uploads, please try again later.'
);

/**
 * Input validation and sanitization
 */
const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const validatePassword = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be between 8 and 128 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');

const validateUsername = body('username')
  .isLength({ min: 3, max: 30 })
  .withMessage('Username must be between 3 and 30 characters')
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username can only contain letters, numbers, and underscores');

const validateName = (field) => body(field)
  .isLength({ min: 1, max: 50 })
  .withMessage(`${field} must be between 1 and 50 characters`)
  .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
  .withMessage(`${field} can only contain letters and spaces`);

/**
 * Validation error handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

/**
 * CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
      : ['http://localhost:3000', 'https://yourdomain.com'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

/**
 * Security middleware for file uploads
 */
const fileUploadSecurity = (req, res, next) => {
  // Check file size
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'File too large',
      maxSize: maxSize
    });
  }
  
  next();
};

/**
 * Anti-CSRF middleware
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and API endpoints
  if (req.method === 'GET' || req.path.startsWith('/api/')) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session ? req.session.csrfToken : null;
  
  if (!token || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }
  
  next();
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    // Log security-related events
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 429) {
      console.warn('Security event:', logData);
    }
    
    // Log slow requests
    if (duration > 1000) {
      console.warn('Slow request:', logData);
    }
  });
  
  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  res.status(statusCode).json({
    success: false,
    message: isDevelopment ? message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
};

module.exports = {
  helmetConfig,
  apiRateLimit,
  authRateLimit,
  passwordResetRateLimit,
  uploadRateLimit,
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  handleValidationErrors,
  corsOptions,
  fileUploadSecurity,
  csrfProtection,
  requestLogger,
  errorHandler
};