import mongoose from 'mongoose';

const dailyColorSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    hex: { type: String, required: true },
    prompt: { type: String, required: true },
  },
  { timestamps: true }
);

export const DailyColor = mongoose.model('DailyColor', dailyColorSchema);
