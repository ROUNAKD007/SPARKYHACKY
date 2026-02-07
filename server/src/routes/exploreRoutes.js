import express from 'express';

import { Submission } from '../models/Submission.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await Submission.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate({ path: 'user', select: 'username' })
      .lean();

    const mapped = items.map((item) => ({
      id: item._id,
      dateKey: item.dateKey,
      images: item.images,
      caption: item.caption,
      createdAt: item.createdAt,
      user: {
        id: item.user?._id,
        username: item.user?.username,
      },
    }));

    res.status(200).json({ items: mapped });
  })
);

export default router;
