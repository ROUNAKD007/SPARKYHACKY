import express from 'express';

import { requireAuth } from '../middleware/auth.js';
import { Submission } from '../models/Submission.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDateKeyUtc, getTodayDateKeyUtc, getYesterdayDateKeyUtc } from '../utils/date.js';

const router = express.Router();
const QUALIFIED_POINTS = 5;

const normalizeImages = (images = []) => {
  if (!Array.isArray(images)) return [];

  return images
    .map((image) => {
      if (typeof image === 'string') {
        return { url: image, publicId: '', width: null, height: null };
      }

      if (!image || typeof image !== 'object') return null;
      if (typeof image.url !== 'string' || image.url.trim().length === 0) return null;

      return {
        url: image.url,
        publicId: typeof image.publicId === 'string' ? image.publicId : '',
        width: Number.isFinite(image.width) ? image.width : null,
        height: Number.isFinite(image.height) ? image.height : null,
      };
    })
    .filter(Boolean);
};

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      images,
      caption = '',
      dateKey: providedDateKey,
      colorName: providedColorName,
      colorHex: providedColorHex,
      colorCheck = {},
    } = req.body;
    const normalizedImages = normalizeImages(images);

    if (normalizedImages.length === 0) {
      throw new AppError('images must be a non-empty array of image objects', 'VALIDATION_ERROR', 400);
    }

    const todayDateKey = getTodayDateKeyUtc();
    const colorDateKey =
      typeof colorCheck.dateKey === 'string'
        ? colorCheck.dateKey
        : typeof req.body.dateKey === 'string'
          ? req.body.dateKey
          : undefined;
    const requestDateKey = providedDateKey || colorDateKey;

    if (requestDateKey && requestDateKey !== todayDateKey) {
      throw new AppError("Only today's dateKey is allowed", 'INVALID_DATE_KEY', 400);
    }

    const user = req.user;
    const qualified = Boolean(colorCheck.qualified);
    const matchRatioRaw = Number(colorCheck.matchRatio);
    const matchRatio = Number.isFinite(matchRatioRaw)
      ? Math.max(0, Math.min(1, Number(matchRatioRaw.toFixed(4))))
      : 0;
    const pointsAwarded = qualified ? QUALIFIED_POINTS : 0;

    const submission = await Submission.create({
      user: user._id,
      dateKey: todayDateKey,
      images: normalizedImages,
      caption,
      matchRatio,
      qualified,
      pointsAwarded,
      colorName:
        typeof providedColorName === 'string'
          ? providedColorName
          : typeof colorCheck.colorName === 'string'
            ? colorCheck.colorName
            : '',
      colorHex:
        typeof providedColorHex === 'string'
          ? providedColorHex
          : typeof colorCheck.colorHex === 'string'
            ? colorCheck.colorHex
            : '',
    });

    const lastDateKey = user.lastSubmissionDate ? getDateKeyUtc(user.lastSubmissionDate) : null;
    const isFirstSubmissionToday = lastDateKey !== todayDateKey;
    const yesterdayDateKey = getYesterdayDateKeyUtc();

    if (isFirstSubmissionToday) {
      if (!user.lastSubmissionDate) {
        user.streakCount = 1;
      } else {
        if (lastDateKey === yesterdayDateKey) {
          user.streakCount += 1;
        } else {
          user.streakCount = 1;
        }
      }
      user.lastSubmissionDate = new Date();
    }

    user.pointsTotal += pointsAwarded;
    await user.save();

    res.status(201).json({
      submission,
      pointsAwarded,
      streakCount: user.streakCount,
      pointsTotal: user.pointsTotal,
      qualified,
      matchRatio,
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
