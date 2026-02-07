import mongoose from 'mongoose';

const submissionImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true, index: true },
    images: {
      type: [submissionImageSchema],
      required: true,
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length > 0 &&
          arr.every((image) => image && typeof image.url === 'string' && image.url.length > 0),
        message: 'At least one image object with url is required',
      },
    },
    caption: { type: String, default: '' },
    matchRatio: { type: Number, default: 0 },
    qualified: { type: Boolean, default: false },
    pointsAwarded: { type: Number, default: 0 },
    colorName: { type: String, default: '' },
    colorHex: { type: String, default: '' },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, dateKey: 1 });

export const Submission = mongoose.model('Submission', submissionSchema);
