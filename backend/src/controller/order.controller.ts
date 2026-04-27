import { appEnv } from "../config/env";
import type { Prisma } from "../generated/prisma";
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
    for (const item of cart.items) {
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
    const TAX_RATE = appEnv.taxRate;
    const SHIPPING_FEE = appEnv.shippingFee;
    const FREE_SHIPPING_THRESHOLD = appEnv.freeShippingThreshold;

    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * TAX_RATE;
    const shippingAmount =
      discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    const total = discountedSubtotal + taxAmount + shippingAmount;

    // Create order transaction
    const order = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const newOrder = await tx.order.create({
          data: {
            userId,
            subtotal,
            tax: taxAmount,
            shipping: shippingAmount,
            discount: discountAmount,
            total,
          },
        });

        // Create order items and deduct stock atomically to avoid overselling.
        for (let item of cart.items) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            },
          });

          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });

          if (updated.count === 0) {
            throw new Error(`Insufficient stock for ${item.product.name}`);
          }
        }

        // Clear cart items and remove coupon
        await tx.cart.update({
          where: { id: cart.id },
          data: { appliedCoupon: null },
        });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return newOrder;
      },
    );

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
    });
  }
};

// get user order
export const getMyOrders = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        refunds: true,
        items: {
          include: {
            product: {
              include: {
                reviews: {
                  where: { userId },
                  select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch orders",
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
    });
  }
};

// Admin super admin: Update order status
export const updateOrderStatus = async (req: any, res: any) => {
  try {
    const { id: orderId } = req.params;
    const { status } = req.body;

    // find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // check valid transition
    if (!canTransition(order.status, status)) {
      return res.status(400).json({
        message: `Invalid transition from ${order.status} to ${status}`,
      });
    }

    // update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    //log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: "ORDER_STATUS_UPDATED",
        entityId: orderId,
        entityType: "Order",
        metadata: {
          from: order.status,
          to: status,
        },
      },
    });

    // handle payment/refund implement
    if (status === "REFUNDED" || status === "PARTIALLY_REFUNDED") {
      // adjust refunded amount
      const refundAmount = order.payments
        .filter(
          (p: (typeof order.payments)[number]) => p.status === "SUCCEEDED",
        )
        .reduce(
          (sum: number, p: (typeof order.payments)[number]) => sum + p.amount,
          0,
        );

      // update order refunded amount
      await prisma.order.update({
        where: { id: orderId },
        data: { refundedAmount: refundAmount },
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to update order status",
    });
  }
};

// Public: Track order by ID
export const trackOrder = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found with this tracking ID." });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch tracking data",
    });
  }
};
