import { prisma } from "../prisma/prisma";

export const simulatePayment = async (req: any, res: any) => {
  try {
    const { orderId, method } = req.body;
    const userId = (req.user as any).id;

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

    // create payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        amount: order.total,
        method,
        status: "SUCCEEDED",
        reference,
      },
    });

    // update order status
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "PAID",
      },
    });

    // clear cart
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
    res.status(200).json({ message: "Payment successful", payment });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
