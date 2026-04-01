import { Request, Response } from "express";
import { prisma } from "../prisma/prisma";

// Add product to wishlist
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    // check user is logged in
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).id;

    // check product id is required
    if (!productId)
      return res.status(400).json({ message: "ProductId is required" });

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: { userId, productId },
    });

    res.status(201).json({ success: true, wishlistItem });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to add to wishlist", error: error.message });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;

    // check user is logged in
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).id;

    // check product id is required
    if (!productId)
      return res.status(400).json({ message: "ProductId is required" });

    await prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });

    res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to remove from wishlist",
      error: error.message,
    });
  }
};

// Get all wishlist items for logged-in user
export const getWishlist = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).id;

    // get all wishlist items for logged in user
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: wishlist });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch wishlist", error: error.message });
  }
};
