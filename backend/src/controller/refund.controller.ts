import { prisma } from "../prisma/prisma";

export const refundOrder = async (req: any, res: any) => {
  try {
    const { orderId, reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "PAID") {
      return res.status(400).json({
        message: "Only PAID orders can be refunded",
      });
    }

    // Find payment
    let payment = await prisma.payment.findFirst({
      where: { orderId },
    });

    // If payment not found but order is PAID, create a backfilled payment record
    if (!payment && order.status === "PAID") {
      payment = await prisma.payment.create({
        data: {
          orderId,
          userId: order.userId,
          amount: order.total,
          method: "MANUAL_FIX",
          status: "SUCCEEDED",
          reference: `FIX-${Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()}`,
        },
      });
    }

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found and could not be backfilled.",
      });
    }

    const refundReference = `REF-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    const refund = await prisma.$transaction(async (tx) => {
      // Create refund record
      const newRefund = await tx.refund.create({
        data: {
          orderId,
          paymentId: payment!.id,
          amount: payment!.amount,
          reason,
          reference: refundReference,
          status: "SUCCEEDED",
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: "REFUNDED" },
      });

      // Update payment status
      await tx.payment.update({
        where: { id: payment!.id },
        data: { status: "REFUNDED" },
      });

      return newRefund;
    });

    return res.status(200).json({
      success: true,
      message: "Order refunded successfully",
      data: refund,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Refund failed",
    });
  }
};

// admin super admin: get all refunds
export const getAllRefunds = async (req: any, res: any) => {
  try {
    const refunds = await prisma.refund.findMany({
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: refunds,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch refunds",
    });
  }
};

// user: get my refunds
export const getMyRefunds = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const refunds = await prisma.refund.findMany({
      where: {
        order: {
          userId,
        },
      },
      include: {
        order: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: refunds,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch refunds",
    });
  }
};


// user: request a refund
export const requestRefund = async (req: any, res: any) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this order" });
    }

    if (!["PAID", "DELIVERED", "SHIPPED"].includes(order.status)) {
      return res.status(400).json({
        message: "Only PAID, SHIPPED, or DELIVERED orders can be refunded",
      });
    }

    // Check if a refund request already exists for this order
    const existingRefund = await prisma.refund.findFirst({
      where: { orderId, status: "PENDING" },
    });

    if (existingRefund) {
      return res.status(400).json({ message: "A refund request is already pending for this order." });
    }

    // Find payment
    const payment = await prisma.payment.findFirst({
      where: { orderId, status: "SUCCEEDED" },
    });

    if (!payment) {
      return res.status(404).json({ message: "No successful payment found for this order." });
    }

    const refundReference = `REQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const refund = await prisma.refund.create({
      data: {
        orderId,
        paymentId: payment.id,
        amount: order.total,
        reason,
        reference: refundReference,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Refund request submitted successfully",
      data: refund,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to submit refund request",
    });
  }
};

// admin: update refund status (Approve/Reject)
export const updateRefundStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // SUCCEEDED or FAILED

    if (!["SUCCEEDED", "FAILED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const refund = await prisma.refund.findUnique({
      where: { id },
      include: { order: true, payment: true },
    });

    if (!refund) {
      return res.status(404).json({ message: "Refund request not found" });
    }

    if (refund.status !== "PENDING") {
      return res.status(400).json({ message: "This refund has already been processed" });
    }

    const updatedRefund = await prisma.$transaction(async (tx) => {
      const updated = await tx.refund.update({
        where: { id },
        data: { status },
      });

      if (status === "SUCCEEDED") {
        // Update order status
        await tx.order.update({
          where: { id: refund.orderId },
          data: { status: "REFUNDED", refundedAmount: refund.amount },
        });

        // Update payment status
        await tx.payment.update({
          where: { id: refund.paymentId },
          data: { status: "REFUNDED" },
        });
      }

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: `Refund request ${status.toLowerCase()} successfully`,
      data: updatedRefund,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to process refund",
    });
  }
};
