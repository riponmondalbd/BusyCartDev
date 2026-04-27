import { Router } from "express";
import passport from "passport";
import { URLSearchParams } from "url";
import {
  googleCallback,
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", logoutUser);

// Google OAuth routes
router.get("/google", (req, res, next) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || "",
    response_type: "code",
    scope: "profile email",
    access_type: "offline",
    prompt: "consent",
  });

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CALLBACK_URL) {
    return next(new Error("Google OAuth environment variables are missing"));
  }

  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
});
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallback,
);

export default router;
