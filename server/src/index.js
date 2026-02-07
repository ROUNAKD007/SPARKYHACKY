import 'dotenv/config';

import cors from 'cors';
import express from 'express';

import session from 'express-session';
import passport from 'passport';
import './config/cloudinary.js';
import './config/passport.js';
import { connectDb } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import dailyColorRoutes from './routes/dailyColorRoutes.js';
import exploreRoutes from './routes/exploreRoutes.js';
import imagesRoutes from './routes/imagesRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CORS_ORIGIN,
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/daily-color', dailyColorRoutes);
app.use('/auth', authRoutes);
app.use('/submissions', submissionRoutes);
app.use('/explore', exploreRoutes);
app.use('/api/images', imagesRoutes);

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
