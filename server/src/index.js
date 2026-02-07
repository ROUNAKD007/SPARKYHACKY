import 'dotenv/config';

import cors from 'cors';
import express from 'express';

import './config/cloudinary.js';
import { connectDb } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import dailyColorRoutes from './routes/dailyColorRoutes.js';
import exploreRoutes from './routes/exploreRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/daily-color', dailyColorRoutes);
app.use('/auth', authRoutes);
app.use('/submissions', submissionRoutes);
app.use('/explore', exploreRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDb();
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
