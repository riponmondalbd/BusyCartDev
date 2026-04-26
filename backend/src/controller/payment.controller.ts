import { prisma } from "../prisma/prisma";

export const simulatePayment = async (req: any, res: any) => {
  try {
    const { orderId, method } = req.body;
    const userId = (req.user as any).id;

    console.log(
      `[PAYMENT] Processing payment for orderId: ${orderId}, method: ${method}, userId: ${userId}`,
    );

    // check order is valid and belongs to user
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId,
      },
    });

    // check order is valid and belongs to user
    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Simulate payment reference
    const reference = `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Determine payment status based on method
    // Stripe = immediate payment (PAID), COD = pending payment (PENDING)
    const normalizedMethod = method?.trim().toLowerCase() || "";
    const isCOD =
      normalizedMethod.includes("cash") || normalizedMethod.includes("cod");

    const paymentStatus = isCOD ? "CREATED" : "SUCCEEDED";
    const orderStatus = isCOD ? "PENDING" : "PAID";

    console.log(
      `[PAYMENT] Method received: "${method}", Normalized: "${normalizedMethod}", isCOD: ${isCOD}, paymentStatus: ${paymentStatus}, orderStatus: ${orderStatus}`,
    );

    // create payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        amount: order.total,
        method,
        status: paymentStatus,
        reference,
      },
    });

    // update order status
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: orderStatus,
      },
    });

    // clear cart
    try {
      await prisma.cart.update({
        where: {
          userId,
        },
        data: {
          items: {
            deleteMany: {},
          },
        },
      });
    } catch (cartError) {
      console.warn("Cart clear warning (non-critical):", cartError);
      // Continue even if cart clearing fails
    }

    // Fetch updated order to confirm status
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    res.status(200).json({
      message: "Payment successful",
      payment,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Payment simulation error:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      fullError: error,
    });
    res.status(500).json({
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
};
