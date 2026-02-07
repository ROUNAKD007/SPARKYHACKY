import express from 'express';

import { Submission } from '../models/Submission.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

const normalizeImages = (images = []) => {
  if (!Array.isArray(images)) return [];

  return images
    .map((image) => {
      if (typeof image === 'string') {
        return { url: image, publicId: '', width: null, height: null };
      }

      if (!image || typeof image !== 'object' || typeof image.url !== 'string') {
        return null;
      }

      return {
        url: image.url,
        publicId: typeof image.publicId === 'string' ? image.publicId : '',
        width: Number.isFinite(image.width) ? image.width : null,
        height: Number.isFinite(image.height) ? image.height : null,
      };
    })
    .filter(Boolean);
};

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
      images: normalizeImages(item.images),
      caption: item.caption,
      createdAt: item.createdAt,
      qualified: Boolean(item.qualified),
      matchRatio: Number.isFinite(item.matchRatio) ? item.matchRatio : 0,
      pointsAwarded: Number.isFinite(item.pointsAwarded) ? item.pointsAwarded : 0,
      colorName: item.colorName || '',
      colorHex: item.colorHex || '',
      user: {
        id: item.user?._id,
        username: item.user?.username,
      },
    }));

    res.status(200).json({ items: mapped });
  })
);

export default router;
