import { Router } from "express";
import passport from "passport";
import { prisma } from "../prisma/prisma";
import { accessCookieOptions, refreshCookieOptions } from "../utils/cookies";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";

const router = Router();

// step: 1 redirect to google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// step: 2 handle google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req: any, res: any) => {
    const user = req.user;

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    // Redirect without embedding tokens in URL.
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success`);
  },
);

export default router;
