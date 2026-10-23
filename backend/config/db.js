const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`[Database Warning] Could not connect to MongoDB at "${uri}".`);
    console.warn(`[Database Warning] Error: ${error.message}`);
    console.warn(`[Database Guidance] The server will still run. When you have MongoDB running or an Atlas URI, update MONGODB_URI in backend/.env and restart.`);
    return null;
  }
};

const getDBStatus = () => ({
  connected: isConnected && mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null
});

module.exports = { connectDB, getDBStatus };
