const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const deliverableRoutes = require('./routes/deliverableRoutes');
const changeRequestRoutes = require('./routes/changeRequestRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');
const { checkDbConnection } = require('./middleware/checkDbConnection');

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (Accessible even if DB is offline for diagnostics)
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const dbStatus = isConnected ? 'connected' : 'disconnected';

  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? 'ok' : 'degraded',
    message: isConnected
      ? 'FreelanceScope API is running'
      : 'FreelanceScope API is running but database is disconnected',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Guard all database-backed API routes with connection check
app.use('/api', checkDbConnection);

// Application API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/changes', changeRequestRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const connected = await connectDB();

  // On Render (production), exit if DB cannot connect — Render will restart the service
  if (!connected && process.env.NODE_ENV === 'production') {
    console.error('[FreelanceScope] Cannot start server without database in production. Exiting.');
    process.exit(1);
  }

  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`[FreelanceScope] Server running on port ${PORT}`);
    });
  }
  return app;
};

const serverPromise = startServer();
app.ready = serverPromise;

module.exports = app;
