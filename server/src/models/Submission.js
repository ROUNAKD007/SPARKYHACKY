import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true, index: true },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one image URL is required',
      },
    },
    caption: { type: String, default: '' },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, dateKey: 1 });

export const Submission = mongoose.model('Submission', submissionSchema);
