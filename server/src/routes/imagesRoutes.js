import express from 'express';
import multer from 'multer';

import cloudinary from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file?.mimetype?.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed'));
  },
});

const uploadBufferToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });

router.post('/upload', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file?.buffer) {
      res.status(400).json({ error: 'Upload failed (no image file)' });
      return;
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'sparkyhacky';
    const result = await uploadBufferToCloudinary(req.file.buffer, folder);

    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const folder = process.env.CLOUDINARY_FOLDER || 'sparkyhacky';
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(90)
      .execute();

    const images = (result.resources || []).map((resource) => ({
      url: resource.secure_url,
      publicId: resource.public_id,
      width: resource.width || null,
      height: resource.height || null,
    }));

    res.status(200).json(images);
  } catch (error) {
    next(error);
  }
});

export default router;
