import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/AppError";

// create product - admin and super admin only
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, price, discount, stock, categoryId } = req.body;

    // Basic validation
    if (!name || !price || stock === undefined || !categoryId) {
      throw new AppError("Name, price, stock and categoryId are required", 400);
    }

    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      throw new AppError("At least one product image is required", 400);
    }

    if (req.files.length > 5) {
      throw new AppError("Maximum 5 images allowed", 400);
    }

    const imageUrls: string[] = [];

    // Single reliable upload method
    for (const file of req.files as Express.Multer.File[]) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "busycart_products",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        stream.end(file.buffer);
      });

      imageUrls.push(uploadResult.secure_url);
    }

    // Optional validation
    if (discount !== undefined && price !== undefined) {
      if (Number(discount) >= Number(price)) {
        throw new AppError("Discount must be less than price", 400);
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(discount !== undefined && { discount: Number(discount) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        images: imageUrls,
        categoryId,
        numReviews: 0,
        averageRating: 0,
      },
    });

    return res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (error: any) {
    next(error);
  }
};

// get all products with pagination and filters
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      category,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Filtering conditions
    const where: any = {
      isDeleted: false,
    };

    // Search by name
    if (search) {
      where.name = {
        contains: search as string,
        mode: "insensitive",
      };
    }

    // Filter by category
    if (category) {
      where.category = {
        is: {
          slug: category as string,
        },
      };
    }
    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    // Sorting
    let orderBy: any = { createdAt: "desc" };

    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy,
        include: {
          category: true,
          // Removed reviews: true to avoid heavy payloads, summary fields exist in product
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalProducts / limitNumber);

    return res.status(200).json({
      success: true,
      meta: {
        totalProducts,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
      },
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// get single product
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Product id is required", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error: any) {
    next(error);
  }
};

// update product - admin and super admin only
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, description, price, discount, stock, categoryId } = req.body;

    if (!id) {
      throw new AppError("Product id is required", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: id as string },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    let imageUrls = product.images; // default: keep old images

    // If new images uploaded
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      // Note: In soft-delete architecture, we might keep old images in Cloudinary
      // for historical order display (invoices). If explicit replacement is needed,
      // we would delete them here. Keeping them for now.

      // Upload new images
      imageUrls = [];
      for (const file of req.files as Express.Multer.File[]) {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "busycart_products" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          stream.end(file.buffer);
        });
        imageUrls.push(uploadResult.secure_url);
      }
    }

    // Optional validation
    if (discount !== undefined && price !== undefined) {
      if (Number(discount) >= Number(price)) {
        throw new AppError("Discount must be less than price", 400);
      }
    }
    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(discount !== undefined && { discount: Number(discount) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        images: imageUrls,
        ...(categoryId && { categoryId }),
      },
    });

    res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (error: any) {
    next(error);
  }
};

// delete product - admin and super admin only
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Product id is required", 400);
    }
    // find product
    const product = await prisma.product.findUnique({
      where: { id: id as string },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Soft delete product from database to maintain historical order data
    await prisma.product.update({
      where: { id: id as string },
      data: { isDeleted: true },
    });

    res.status(200).json({
      success: true,
      message: "Product soft-deleted successfully",
    });
  } catch (error: any) {
    next(error);
  }
};
