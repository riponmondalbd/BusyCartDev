import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/AppError";

const DEAL_ID = "current";

export const getCurrentDealOfDay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dealOfDay = await prisma.dealOfDay.findUnique({
      where: { id: DEAL_ID },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: dealOfDay,
    });
  } catch (error: any) {
    next(error);
  }
};

export const setDealOfDay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, endsAt } = req.body;

    if (!productId || !endsAt) {
      throw new AppError("productId and endsAt are required", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId as string },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const endDate = new Date(endsAt);
    if (Number.isNaN(endDate.getTime())) {
      throw new AppError("Invalid endsAt value", 400);
    }

    if (endDate.getTime() <= Date.now()) {
      throw new AppError("Deal end time must be in the future", 400);
    }

    const dealOfDay = await prisma.dealOfDay.upsert({
      where: { id: DEAL_ID },
      create: {
        id: DEAL_ID,
        productId: productId as string,
        endsAt: endDate,
      },
      update: {
        productId: productId as string,
        endsAt: endDate,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: dealOfDay,
    });
  } catch (error: any) {
    next(error);
  }
};

export const clearDealOfDay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await prisma.dealOfDay.deleteMany({
      where: { id: DEAL_ID },
    });

    res.status(200).json({
      success: true,
      message: "Deal of the day cleared",
    });
  } catch (error: any) {
    next(error);
  }
};
