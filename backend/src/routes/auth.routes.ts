import { Router } from "express";
import passport from "passport";
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
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallback,
);

export default router;
