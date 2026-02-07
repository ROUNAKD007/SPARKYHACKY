import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true }, // Removed unique: true because google users might not pick a username, we'll handle uniqueness in logic
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: false }, // Optional for Google users
    googleId: { type: String, unique: true, sparse: true }, // Sparse unique index
    avatar: { type: String },
    pointsTotal: { type: Number, default: 0 },
    streakCount: { type: Number, default: 0 },
    lastSubmissionDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
