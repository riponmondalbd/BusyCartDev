import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";

// register user
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    res
      .status(201)
      .json({ message: "User registered successfully", id: user.id });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

// login user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // valid user check
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatched = await bcrypt.compare(password, user.password!);
    if (!isMatched) {
      return res.status(400).json({ message: "Invalid credentials" });
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
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful", token: accessToken });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user" });
  }
};

// logout user
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(400).json({ message: "No refresh token found" });
    }

    // delete refresh token from DB
    await prisma.refreshToken.delete({
      where: { token },
    });

    // clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out user" });
  }
};
