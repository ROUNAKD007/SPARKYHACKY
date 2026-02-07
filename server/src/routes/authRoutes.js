import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

const createToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Google Auth Route
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google Auth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = createToken(req.user._id.toString());
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_ORIGIN}?token=${token}`);
  }
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new AppError('username, email, and password are required', 'VALIDATION_ERROR', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      throw new AppError('Username or email already in use', 'CONFLICT', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      pointsTotal: 0,
      streakCount: 0,
      lastSubmissionDate: null,
    });

    const token = createToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('email and password are required', 'VALIDATION_ERROR', 400);
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });

    if (!user) {
      throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    const token = createToken(user._id.toString());

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user;

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
        pointsTotal: user.pointsTotal || 0,
        streakCount: user.streakCount || 0,
      },
    });
  })
);

export default router;
