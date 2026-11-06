/**
 * Start Local MongoDB for FreelanceScope development
 * Uses the local mongod binary with persistent storage in ./data/db
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

const port = 27017;
const dbDir = path.join(__dirname, 'data', 'db');

const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is already in use (MongoDB is already running)
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is free
    });
    server.listen(port);
  });
};

const start = async () => {
  const isRunning = await checkPort(port);
  if (isRunning) {
    console.log(`[MongoDB] A MongoDB service is already running on port ${port}. Ready to use!`);
    return;
  }

  // Ensure data directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const binaryPath = path.join(
    __dirname,
    'node_modules',
    '.cache',
    'mongodb-memory-server',
    'mongod-x64-win32-8.2.6.exe'
  );

  if (!fs.existsSync(binaryPath)) {
    console.error(`[MongoDB Error] mongod binary not found at: ${binaryPath}`);
    console.error('Please install or run local MongoDB Community Edition or configure MONGODB_URI in server/.env');
    process.exit(1);
  }

  console.log(`[MongoDB] Starting local MongoDB on port ${port}...`);
  console.log(`[MongoDB] Data directory: ${dbDir}`);

  const mongod = spawn(binaryPath, ['--dbpath', dbDir, '--port', String(port), '--bind_ip', '127.0.0.1'], {
    stdio: 'inherit',
  });

  mongod.on('error', (err) => {
    console.error(`[MongoDB Error] Failed to start mongod: ${err.message}`);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log('\n[MongoDB] Stopping database process...');
    mongod.kill('SIGINT');
    process.exit(0);
  });
};

start();

