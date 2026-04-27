import { prisma } from "../prisma/prisma";

// create coupon only for admin super admin
export const createCoupon = async (req: any, res: any) => {
  try {
    const { code, discount, type, minAmount, expiresAt } = req.body;

    // Validate input
    if (!code || !discount || !type || !expiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields missing" });
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code,
        discount,
        type, // "FIXED" or "PERCENTAGE"
        minAmount,
        expiresAt: new Date(expiresAt),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

// apply coupon to cart
export const applyCoupon = async (req: any, res: any) => {
  try {
    const { code } = req.body;
    const userId = (req.user as any).id;

    // Find cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty or not found",
      });
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce(
      (sum: number, item: (typeof cart.items)[number]) =>
        sum + item.product.price * item.quantity,
      0,
    );

    // Find coupon
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    if (new Date() > coupon.expiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon expired" });
    }

    if (coupon.minAmount && subtotal < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount ${coupon.minAmount} required`,
      });
    }

    // Update cart
    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: { appliedCoupon: code },
    });

    return res.status(200).json({
      success: true,
      message: "Coupon applied to cart successfully",
      data: { cart: updatedCart, coupon },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
    });
  }
};

// remove coupon from cart
export const removeCoupon = async (req: any, res: any) => {
  try {
    const userId = (req.user as any).id;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: { appliedCoupon: null },
    });

    return res.status(200).json({
      success: true,
      message: "Coupon removed from cart",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove coupon",
    });
  }
};

// get all coupons
export const getAllCoupons = async (req: any, res: any) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

// delete coupon
export const deleteCoupon = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};
