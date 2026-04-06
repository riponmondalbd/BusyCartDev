import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

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
  (req: any, res: any) => {
    const user = req.user;

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1h" },
    );

    // redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  },
);

export default router;
