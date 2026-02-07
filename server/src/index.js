import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

const startServer = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
    }
  } else {
    console.log('MONGO_URI not set. Starting server without MongoDB connection.');
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
};

startServer();
