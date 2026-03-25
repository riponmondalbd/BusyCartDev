import bcrypt from "bcrypt";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary";
import { prisma } from "../prisma/prisma";

// get user profile
export const getProfile = async (req: any, res: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// update user profile name and email
export const updateUserProfile = async (req: any, res: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email },
      select: {
        name: true,
        email: true,
      },
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// update password
export const updatePassword = async (req: any, res: any) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // If user has password (not Google-only account)
    if (!user.password)
      return res
        .status(400)
        .json({ message: "Cannot change password for Google login" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// update profile picture
export const updateProfilePhoto = async (req: any, res: any) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Delete old photo if exists
    if (user.imagePublicId) {
      await cloudinary.uploader.destroy(user.imagePublicId);
    }

    // Upload new photo
    const uploadFromBuffer = () =>
      new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile_images" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );
        streamifier.createReadStream(req.file!.buffer).pipe(stream);
      });

    const result = await uploadFromBuffer();

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        imageUrl: result.secure_url,
        imagePublicId: result.public_id,
      },
    });

    res.json({
      message: "Profile photo updated successfully",
      // user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
