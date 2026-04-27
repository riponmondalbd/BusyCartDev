import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { prisma } from "../prisma/prisma";

// create banner - admin super admin only
export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, tagline, desc, price, color, link, order } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Banner title is required",
      });
    }

    let imageUrl: string | null = null;

    // If an image file is uploaded
    if (req.file) {
      const file = req.file;
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "busycart_banners" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    if (!imageUrl) {
        return res.status(400).json({
            message: "Banner image is required",
        });
    }

    const newBanner = await prisma.banner.create({
      data: {
        title,
        tagline,
        desc,
        price,
        color: color || "#66fcf1",
        link: link || "/products",
        image: imageUrl,
        order: order ? parseInt(order) : 0,
      },
    });

    return res.status(201).json({
      success: true,
      banner: newBanner,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create banner",
    });
  }
};

// get active banners for homepage
export const getActiveBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
      },
      orderBy: { order: "asc" },
    });

    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch banners",
    });
  }
};

// get all banners for admin
export const getAdminBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch banners",
    });
  }
};

// update banner
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, tagline, desc, price, color, link, order, isActive } = req.body;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return res.status(404).json({
        message: "Banner not found",
      });
    }

    let imageUrl = banner.image;

    if (req.file) {
      const file = req.file;
      // Delete old image
      const parts = banner.image.split("/");
      const publicIdWithExt = parts.slice(-1)[0];
      const publicId = `busycart_banners/${publicIdWithExt.split(".")[0]}`;
      await cloudinary.uploader.destroy(publicId).catch(() => null);

      // Upload new
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "busycart_banners" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        tagline,
        desc,
        price,
        color,
        link,
        image: imageUrl,
        order: order ? parseInt(order) : undefined,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      banner: updatedBanner,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to update banner",
    });
  }
};

// delete banner
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return res.status(404).json({
        message: "Banner not found",
      });
    }

    // Delete from cloudinary
    const parts = banner.image.split("/");
    const publicIdWithExt = parts.slice(-1)[0];
    const publicId = `busycart_banners/${publicIdWithExt.split(".")[0]}`;
    await cloudinary.uploader.destroy(publicId).catch(() => null);

    await prisma.banner.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to delete banner",
    });
  }
};
