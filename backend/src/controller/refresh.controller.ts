import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/prisma";
import { accessCookieOptions, refreshCookieOptions } from "../utils/cookies";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";

type RefreshTokenPayload = {
  id: string;
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // check if token exist in db
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (storedToken.expiresAt.getTime() < Date.now()) {
      await prisma.refreshToken.deleteMany({ where: { token } });
      return res.status(401).json({ message: "Token expired" });
    }

    // verify token
    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET!,
      ) as RefreshTokenPayload;
    } catch (error) {
      // token expired or invalid
      await prisma.refreshToken.deleteMany({ where: { token } });
      return res.status(401).json({ message: "Token expired or invalid" });
    }

    const userID = decoded.id;

    // delete old token
    await prisma.refreshToken.deleteMany({ where: { token } });

    // generate new token
    const user = await prisma.user.findUnique({ where: { id: userID } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(userID, user.role);
    const newRefreshToken = generateRefreshToken(userID);

    // store new refresh token to db
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: userID,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // send new token
    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);
    res.cookie("accessToken", newAccessToken, accessCookieOptions);

    res.json({
      message: "Token refreshed successfully",
      token: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
