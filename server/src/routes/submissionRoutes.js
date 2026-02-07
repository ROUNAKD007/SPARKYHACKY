import express from 'express';

import { requireAuth } from '../middleware/auth.js';
import { Submission } from '../models/Submission.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDateKeyUtc, getTodayDateKeyUtc, getYesterdayDateKeyUtc } from '../utils/date.js';

const router = express.Router();
const DAILY_POINTS = 10;

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { images, caption = '', dateKey: providedDateKey } = req.body;

    if (!Array.isArray(images) || images.length === 0 || images.some((url) => typeof url !== 'string')) {
      throw new AppError('images must be a non-empty array of strings', 'VALIDATION_ERROR', 400);
    }

    const todayDateKey = getTodayDateKeyUtc();

    if (providedDateKey && providedDateKey !== todayDateKey) {
      throw new AppError("Only today's dateKey is allowed", 'INVALID_DATE_KEY', 400);
    }

    const user = req.user;

    const submission = await Submission.create({
      user: user._id,
      dateKey: todayDateKey,
      images,
      caption,
    });

    const alreadyAwardedToday = await Submission.exists({
      user: user._id,
      dateKey: todayDateKey,
      _id: { $ne: submission._id },
    });

    let pointsAwarded = 0;

    if (!alreadyAwardedToday) {
      pointsAwarded = DAILY_POINTS;
      user.pointsTotal += pointsAwarded;

      if (!user.lastSubmissionDate) {
        user.streakCount = 1;
      } else {
        const lastDateKey = getDateKeyUtc(user.lastSubmissionDate);
        const yesterdayDateKey = getYesterdayDateKeyUtc();

        if (lastDateKey === todayDateKey) {
          // no-op: already handled by points guard above
        } else if (lastDateKey === yesterdayDateKey) {
          user.streakCount += 1;
        } else {
          user.streakCount = 1;
        }
      }

      user.lastSubmissionDate = new Date();
      await user.save();
    }

    res.status(201).json({
      submission,
      pointsAwarded,
      streakCount: user.streakCount,
      pointsTotal: user.pointsTotal,
    });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ submissions });
  })
);

export default router;
