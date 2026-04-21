const rateLimit = require('express-rate-limit');

// General rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  handler: (req, res) => {
    res.status(429).json({ 
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: req.rateLimit.resetTime 
    });
  },
  skip: (req, res) => false,
  keyGenerator: (req, res) => req.ip
});

module.exports = {
  limiter,
  authLimiter
};
