import express from 'express';

import { DailyColor } from '../models/DailyColor.js';
import { getTodayDateKeyUtc } from '../utils/date.js';

const router = express.Router();

const WEEKLY_COLORS = [
  {
    name: 'Red',
    hex: '#EF4444',
    prompt: 'Find something bold and full of energy.',
  },
  {
    name: 'Orange',
    hex: '#F97316',
    prompt: 'Capture warmth, light, or movement.',
  },
  {
    name: 'Yellow',
    hex: '#EAB308',
    prompt: 'Look for optimism and bright contrast.',
  },
  {
    name: 'Green',
    hex: '#22C55E',
    prompt: 'Share a fresh or natural moment.',
  },
  {
    name: 'Blue',
    hex: '#3B82F6',
    prompt: 'Show calm, depth, or open space.',
  },
  {
    name: 'Indigo',
    hex: '#6366F1',
    prompt: 'Capture moody tones and evening vibes.',
  },
  {
    name: 'Violet',
    hex: '#8B5CF6',
    prompt: 'Find something creative and unexpected.',
  },
];

const getColorForDateKey = (dateKey) => {
  const dayFromEpoch = Math.floor(Date.parse(`${dateKey}T00:00:00.000Z`) / 86_400_000);
  const index = ((dayFromEpoch % WEEKLY_COLORS.length) + WEEKLY_COLORS.length) % WEEKLY_COLORS.length;
  return WEEKLY_COLORS[index];
};

router.get('/today', async (req, res, next) => {
  try {
    const dateKey = getTodayDateKeyUtc();
    let dailyColor = await DailyColor.findOne({ dateKey });

    if (!dailyColor) {
      const color = getColorForDateKey(dateKey);
      dailyColor = await DailyColor.create({ dateKey, ...color });
    }

    res.status(200).json({
      dateKey: dailyColor.dateKey,
      name: dailyColor.name,
      hex: dailyColor.hex,
      prompt: dailyColor.prompt,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
