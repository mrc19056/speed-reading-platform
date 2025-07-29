const cors = require('cors');

/**
 * CORS Configuration for Speed Reading Platform
 * Production-optimized Cross-Origin Resource Sharing settings
 */

/**
 * Environment-based CORS origins
 */
const getAllowedOrigins = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return [
        'https://yourdomain.com',
        'https://www.yourdomain.com',
        'https://app.yourdomain.com',
        'https://admin.yourdomain.com'
      ];
    
    case 'staging':
      return [
        'https://staging.yourdomain.com',
        'https://test.yourdomain.com',
        'http://localhost:3000',
        'http://localhost:3001'
      ];
    
    case 'development':
    default:
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:8080'
      ];
  }
};

/**
 * Dynamic origin checker
 */
const originChecker = (origin, callback) => {
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
    : getAllowedOrigins();
  
  // Allow requests with no origin (mobile apps, Postman, curl, etc.)
  if (!origin) {
    return callback(null, true);
  }
  
  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  
  // Allow localhost in development
  if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
    return callback(null, true);
  }
  
  // Reject origin
  const error = new Error(`CORS policy violation: Origin ${origin} not allowed`);
  error.statusCode = 403;
  callback(error);
};

/**
 * Main CORS configuration
 */
const corsOptions = {
  origin: originChecker,
  
  // Allow credentials (cookies, authorization headers)
  credentials: process.env.CORS_CREDENTIALS === 'true' || process.env.NODE_ENV === 'development',
  
  // Allowed HTTP methods
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
    'HEAD'
  ],
  
  // Allowed headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-API-Key',
    'Cache-Control',
    'Pragma',
    'If-Modified-Since',
    'X-User-Agent',
    'X-Client-Version'
  ],
  
  // Headers exposed to the client
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-Response-Time',
    'X-API-Version'
  ],
  
  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours
  
  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

/**
 * API-specific CORS configuration
 */
const apiCorsOptions = {
  ...corsOptions,
  
  // More restrictive for API endpoints
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Requested-With'
  ],
  
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH'
  ]
};

/**
 * Public resource CORS configuration (for static assets)
 */
const publicCorsOptions = {
  origin: '*', // Allow all origins for public resources
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Cache-Control'],
  maxAge: 31536000 // 1 year cache for preflight
};

/**
 * Development-only CORS configuration
 */
const devCorsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: '*',
  exposedHeaders: '*',
  maxAge: 3600 // 1 hour in development
};

/**
 * WebSocket CORS configuration
 */
const websocketCorsOptions = {
  origin: originChecker,
  credentials: true
};

/**
 * CORS middleware factory
 */
const createCorsMiddleware = (options = corsOptions) => {
  return cors(options);
};

/**
 * Conditional CORS middleware based on environment
 */
const conditionalCors = (req, res, next) => {
  const environment = process.env.NODE_ENV || 'development';
  
  let options;
  
  switch (environment) {
    case 'production':
      options = corsOptions;
      break;
    case 'staging':
      options = corsOptions;
      break;
    case 'development':
    default:
      options = devCorsOptions;
      break;
  }
  
  // Apply different CORS policies based on route
  if (req.path.startsWith('/api/')) {
    options = apiCorsOptions;
  } else if (req.path.startsWith('/public/') || req.path.startsWith('/static/')) {
    options = publicCorsOptions;
  }
  
  return cors(options)(req, res, next);
};

/**
 * CORS error handler
 */
const corsErrorHandler = (err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: 'Cross-origin request blocked by CORS policy',
      origin: req.get('Origin'),
      timestamp: new Date().toISOString()
    });
  }
  
  next(err);
};

/**
 * Security headers for CORS
 */
const corsSecurityHeaders = (req, res, next) => {
  // Vary header for caching
  res.set('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  
  // Additional security headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  
  next();
};

/**
 * Logging CORS requests
 */
const corsLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const origin = req.get('Origin');
    const method = req.method;
    
    if (origin && method === 'OPTIONS') {
      console.log(`CORS Preflight: ${origin} -> ${req.path}`);
    } else if (origin) {
      console.log(`CORS Request: ${origin} -> ${method} ${req.path}`);
    }
  }
  
  next();
};

module.exports = {
  corsOptions,
  apiCorsOptions,
  publicCorsOptions,
  devCorsOptions,
  websocketCorsOptions,
  createCorsMiddleware,
  conditionalCors,
  corsErrorHandler,
  corsSecurityHeaders,
  corsLogger,
  getAllowedOrigins
};