import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';

import { User } from '../models/User.js';


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const googleId = profile.id;
                const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
                const username = profile.displayName;

                // Check if user exists by googleId or email
                let user = await User.findOne({
                    $or: [{ googleId }, { email }],
                });

                if (user) {
                    // Update googleId and avatar if not present or changed
                    if (!user.googleId) user.googleId = googleId;
                    if (avatar && user.avatar !== avatar) user.avatar = avatar;
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    username,
                    email,
                    googleId,
                    avatar,
                    passwordHash: null, // No password for Google users
                    pointsTotal: 0,
                    streakCount: 0,
                    lastSubmissionDate: null,
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
