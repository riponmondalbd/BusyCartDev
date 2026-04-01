import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { prisma } from "../prisma/prisma";

// create product - admin and super admin only
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, discount, stock, categoryId } = req.body;

    // Basic validation
    if (!name || !price || stock === undefined || !categoryId) {
      return res.status(400).json({
        message: "Name, price, stock and categoryId are required",
      });
    }

    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one product image is required",
      });
    }

    if (req.files.length > 5) {
      return res.status(400).json({
        message: "Maximum 5 images allowed",
      });
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
        return res.status(400).json({
          message: "Discount must be less than price",
        });
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
      },
    });

    return res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// get all products with pagination and filters
export const getAllProducts = async (req: any, res: any) => {
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

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Filtering conditions
    const where: any = {
      isDeleted: false,
    };

    // Search by name
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Filter by category
    if (category) {
      where.category = {
        is: {
          slug: category,
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
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: (error as Error).message,
    });
  }
};

// get single product
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Product id is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to get product",
      error: error.message,
    });
  }
};

// update product - admin and super admin only
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, discount, stock } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Product id is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: id as string },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let imageUrls = product.images; // default: keep old images

    // If new images uploaded
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      //  Delete old images from Cloudinary
      for (const url of product.images) {
        // Extract public_id from URL
        const parts = url.split("/");
        const publicIdWithExtension = parts.slice(-1)[0]; // last part
        const publicId = `busycart_products/${publicIdWithExtension.split(".")[0]}`;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Failed to delete Cloudinary image:", err);
        }
      }

      //  Upload new images
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
        return res.status(400).json({
          message: "Discount must be less than price",
        });
      }
    }
    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data: {
        name,
        description,
        price: Number(price),
        discount: discount ? Number(discount) : null,
        stock: Number(stock),
        images: imageUrls,
      },
    });

    res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// delete product - admin and super admin only
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Product id is required",
      });
    }
    // find product
    const product = await prisma.product.findUnique({
      where: { id: id as string },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    for (const url of product.images) {
      const parts = url.split("/");
      const publicIdWithExtension = parts.slice(-1)[0];
      const publicId = `busycart_products/${publicIdWithExtension.split(".")[0]}`;
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Failed to delete Cloudinary image:", err);
      }
    }

    // Delete product from database
    await prisma.product.delete({
      where: { id: id as string },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};
