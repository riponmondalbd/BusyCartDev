import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { prisma } from "../prisma/prisma";

// create category - admin super admin only
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, parentId } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        message: "Category name and slug is required",
      });
    }

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(400).json({
        message: "Category slug already exists",
      });
    }

    // If parentId provided, check if parent exists
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return res.status(404).json({
          message: "Parent category not found",
        });
      }
    }

    let imageUrl: string | null = null;

    // If an image file is uploaded
    if (req.file) {
      const file = req.file;
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "busycart_categories" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null,
        image: imageUrl,
      },
    });

    return res.status(201).json({
      success: true,
      category: newCategory,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
};

// get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};
