const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freelancescope';
  // Sanitize URI for safe logging (mask password if present)
  const sanitizedUri = uri.replace(/:([^:@]+)@/, ':****@');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast after 5 seconds instead of 10-30s hanging
    });
    console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB (${sanitizedUri}): ${error.message}`);
    console.error(`[Database Help] Ensure MongoDB is running locally (e.g. net start MongoDB or npm run db) or verify MONGODB_URI in server/.env`);
    return false;
  }
};

module.exports = connectDB;
