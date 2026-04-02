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
          status: "PAID",
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
          status: "SUCCESS",
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
      error: error.message,
    });
  }
};
