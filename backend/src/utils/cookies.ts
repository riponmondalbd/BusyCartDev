import { CookieOptions } from "express";
import { appEnv } from "../config/env";

const sameSite = appEnv.isProduction ? "none" : "lax";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: appEnv.isProduction,
  sameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const accessCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: appEnv.isProduction,
  sameSite,
  maxAge: 15 * 60 * 1000,
  path: "/",
};
