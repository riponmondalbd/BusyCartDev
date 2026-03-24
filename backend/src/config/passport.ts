import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../prisma/prisma";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        // existing user check
        if (existingUser) {
          return done(null, existingUser);
        }

        // if existing email found but no googleId, link accounts
        const emailUser = await prisma.user.findUnique({
          where: { email: profile.emails?.[0].value },
        });

        // set googleId for existing email user
        if (emailUser) {
          const updateUser = await prisma.user.update({
            where: { id: emailUser.id },
            data: { googleId: profile.id },
          });

          return done(null, updateUser);
        }

        // create new user
        const newUser = await prisma.user.create({
          data: {
            name: profile.displayName,
            email: profile.emails?.[0].value!,
            googleId: profile.id,
            isVerified: true, // google verified email
          },
        });

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

export default passport;
