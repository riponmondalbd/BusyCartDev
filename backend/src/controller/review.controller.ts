import { Prisma } from "../generated/prisma";
import { prisma } from "../prisma/prisma";

// create review
export const createReview = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    // check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // check if user has purchased and received this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: "DELIVERED",
        },
      },
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased and received",
      });
    }

    // check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
      },
    });

    // update product average rating
    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: review.productId },
      data: {
        averageRating: agg._avg.rating ?? 0,
        numReviews: agg._count.rating ?? 0,
      } as Prisma.ProductUpdateInput,
    });

    return res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// update review
export const updateReview = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    // check if review exists
    if (!review || review.userId !== userId) {
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });
    }

    // update review
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment },
    });

    // Update product averageRating
    const agg = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // update product average rating
    await prisma.product.update({
      where: { id: review.productId },
      data: {
        averageRating: agg._avg.rating ?? 0,
        numReviews: agg._count.rating ?? 0,
      } as Prisma.ProductUpdateInput,
    });

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// delete review
export const deleteReview = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    // check if review exists
    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review || review.userId !== userId) {
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    // Update product averageRating
    const agg = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        averageRating: agg._avg.rating ?? 0,
        numReviews: agg._count.rating ?? 0,
      } as Prisma.ProductUpdateInput,
    });

    return res.json({ success: true, message: "Review deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//get single product reviews
export const getProductReviews = async (req: any, res: any) => {
  try {
    const { productId } = req.params;

    // check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // get product reviews
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // get product average rating and number of reviews
    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return res.json({
      success: true,
      data: reviews,
      averageRating: agg._avg.rating || 0,
      numReviews: agg._count.rating || 0,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get all review for public
export const getAllReviewsPublic = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build search condition
    const whereCondition = search
      ? {
          OR: [
            { comment: { contains: search, mode: "insensitive" as const } },
            {
              user: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            {
              product: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {};

    // Fetch reviews and total count using transaction
    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where: whereCondition,
        include: {
          user: { select: { id: true, name: true, imageUrl: true } },
          product: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: whereCondition }),
    ]);

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
