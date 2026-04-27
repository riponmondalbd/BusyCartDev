import { prisma } from "../prisma/prisma";

type TopProductRow = {
  productId: string;
  _sum: {
    quantity: number | null;
  };
};

type RevenueRow = {
  createdAt: Date;
  _sum: {
    total: number | null;
  };
};

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
      topProducts.map(async (item: TopProductRow) => {
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
    });
  }
};

// Revenue Analytics
export const getRevenueAnalytics = async (req: any, res: any) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    // Total Revenue (only completed orders)
    const totalRevenueData = await prisma.order.aggregate({
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: start, lte: end },
      },
      _sum: { total: true },
    });

    const totalRevenue = totalRevenueData._sum.total || 0;

    // Refund amount (partial + full)
    const totalRefundData = await prisma.refund.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    const totalRefund = totalRefundData._sum.amount || 0;

    // Refund Rate
    const refundRate = totalRevenue ? (totalRefund / totalRevenue) * 100 : 0;

    // Monthly Revenue
    const monthlyRevenueRaw = await prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: start, lte: end },
      },
      _sum: { total: true },
    });

    // Aggregate monthly totals
    const monthlyRevenue: Record<string, number> = {};
    monthlyRevenueRaw.forEach((order: RevenueRow) => {
      const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyRevenue[month] =
        (monthlyRevenue[month] || 0) + (order._sum.total || 0);
    });

    // Yearly Revenue
    const yearlyRevenue: Record<string, number> = {};
    monthlyRevenueRaw.forEach((order: RevenueRow) => {
      const year = order.createdAt.getFullYear().toString();
      yearlyRevenue[year] =
        (yearlyRevenue[year] || 0) + (order._sum.total || 0);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalRefund,
        refundRate,
        monthlyRevenue,
        yearlyRevenue,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch revenue analytics",
    });
  }
};
