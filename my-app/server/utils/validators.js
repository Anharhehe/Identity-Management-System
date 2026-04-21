const validator = require('validator');

// Validation middleware for registration
const validateRegistration = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  
  const errors = [];
  
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  // Password strength validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (password && !passwordRegex.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Validation middleware for identity
const validateIdentity = (req, res, next) => {
  const { legalName, preferredName, context, accountPrivacy } = req.body;
  
  const errors = [];
  
  if (!legalName || legalName.trim().length < 2) {
    errors.push('Legal name must be at least 2 characters long');
  }
  
  if (!preferredName || preferredName.trim().length < 2) {
    errors.push('Preferred name must be at least 2 characters long');
  }
  
  if (preferredName && /\s/.test(preferredName)) {
    errors.push('Preferred name cannot contain spaces');
  }
  
  if (!context || !['professional', 'personal', 'family', 'online'].includes(context)) {
    errors.push('Context must be one of: professional, personal, family, or online');
  }
  
  if (!accountPrivacy || !['private', 'public'].includes(accountPrivacy)) {
    errors.push('Account privacy must be either private or public');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateIdentity
};
