const mongoose = require('mongoose');

/**
 * Middleware that verifies MongoDB connection is active.
 * Prevents requests from buffering for 10000ms when database is offline.
 * Returns HTTP 503 Service Unavailable with actionable error guidance.
 */
const checkDbConnection = (req, res, next) => {
  // 1 = connected, 0 = disconnected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      status: 'error',
      message: 'Database is unavailable. MongoDB is not connected.',
      database: 'disconnected',
      help: 'Please ensure MongoDB is running (e.g., local MongoDB service or npm run db) and MONGODB_URI in server/.env is valid.',
    });
  }
  next();
};

module.exports = { checkDbConnection };

