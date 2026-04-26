import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/AppError";
import { accessCookieOptions, refreshCookieOptions } from "../utils/cookies";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";

// register user
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, email, password, role } = req.body;

  try {
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "USER" },
    });

    res
      .status(201)
      .json({ message: "User registered successfully", id: user.id });
  } catch (error) {
    next(error);
  }
};

// login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // valid user check
    if (!user) {
      throw new AppError("Invalid credentials", 400);
    }

    if (!user.password) {
      throw new AppError(
        "This account was registered using Google. Please use Google Login.",
        400,
      );
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      throw new AppError("Invalid credentials", 400);
    }

    //  generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // store refresh token to DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    //  Send refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.cookie("accessToken", accessToken, accessCookieOptions);

    res.json({ message: "Login successful", token: accessToken });
  } catch (error) {
    next(error);
  }
};

// logout user
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new AppError("No refresh token found", 400);
    }

    // delete refresh token from DB
    await prisma.refreshToken.deleteMany({
      where: { token },
    });

    // clear refresh token cookie
    res.clearCookie("refreshToken", refreshCookieOptions);
    res.clearCookie("accessToken", accessCookieOptions);
    res.json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

// google auth callback
export const googleCallback = async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=Google auth failed`,
      );
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // store refresh token to DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.cookie("accessToken", accessToken, accessCookieOptions);

    // redirect to frontend with token in query param
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${accessToken}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=Server error`);
  }
};
