import { prisma } from "../prisma/prisma";
import { canTransition } from "../utils/orderStateMachine";


// create order
export const createOrder = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;

    // Validate stock
    for (let item of cart.items) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
      subtotal += item.product.price * item.quantity;
    }

    // Apply coupon from cart if it exists
    let discountAmount = 0;
    if (cart.appliedCoupon) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: cart.appliedCoupon },
      });
      if (
        coupon &&
        new Date() <= coupon.expiresAt &&
        (!coupon.minAmount || subtotal >= coupon.minAmount)
      ) {
        discountAmount =
          coupon.type === "FIXED"
            ? coupon.discount
            : (subtotal * coupon.discount) / 100;
      }
    }

    // ---- TAX & SHIPPING ----
    const TAX_RATE = 0.1; // 10% tax
    const SHIPPING_FEE = 20;
    const FREE_SHIPPING_THRESHOLD = 500;

    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * TAX_RATE;
    const shippingAmount =
      discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    const total = discountedSubtotal + taxAmount + shippingAmount;

    // Create order transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          subtotal,
          total,
        },
      });

      // Create order items and deduct stock
      for (let item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: item.product.stock - item.quantity },
        });
      }

      // Clear cart items and remove coupon
      await tx.cart.update({
        where: { id: cart.id },
        data: { appliedCoupon: null },
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: {
        order,
        breakdown: {
          subtotal,
          discountAmount,
          taxAmount,
          shippingAmount,
          total,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// get user order
export const getMyOrders = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Admin super admin: Get all orders
export const getAllOrders = async (req: any, res: any) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true, // include product info
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Admin super admin: Update order status
export const updateOrderStatus = async (req: any, res: any) => {
  try {
    const { id: orderId } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!canTransition(order.status, status)) {
      return res.status(400).json({
        message: `Invalid transition from ${order.status} to ${status}`,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
