import { prisma } from "../prisma/prisma";

// Get Top Products
export const getTopProducts = async (req: any, res: any) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date("2000-01-01");
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    const results = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          productId: item.productId,
          name: product?.name,
          image: product?.images?.[0] || null,
          totalSold: item._sum.quantity,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
      error: error.message,
    });
  }
};
