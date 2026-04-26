import cloudinary from "../config/cloudinary";
import { prisma } from "../prisma/prisma";

// admin only
// get all users list - admin only
export const getAllUsers = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// delete user - admin only
export const deleteUserByAdmin = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "User id is required" });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // prevent admin from deleting other admins or super admins
    if (user.role !== "USER") {
      return res
        .status(403)
        .json({ message: "You can only delete regular users" });
    }

    // delete profile image from cloudinary
    if (user.imagePublicId) {
      await cloudinary.uploader.destroy(user.imagePublicId);
    }

    // delete user from database
    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// update user role - admin only
export const updateUserRoleAdmin = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate input
    if (!id) return res.status(400).json({ message: "User id is required" });
    if (!role) return res.status(400).json({ message: "Role is required" });

    // Only ADMIN can access this route
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate role
    const validRoles = ["USER", "ADMIN"]; // Admin can only assign these roles
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message:
          "Admins can only promote user to Admin or demote Admin to User",
      });
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent Admin from changing SUPER_ADMINs
    if (user.role === "SUPER_ADMIN") {
      return res.status(403).json({
        message: "Admins cannot change Super Admin roles",
      });
    }

    // Prevent Admin from changing their own role
    if (user.id === req.user.id) {
      return res.status(403).json({
        message: "You cannot change your own role",
      });
    }

    // Prevent promoting an Admin to Admin again
    if (role === "ADMIN" && user.role === "ADMIN") {
      return res.status(400).json({
        message: "User is already an Admin",
      });
    }

    // Prevent demoting a USER to USER again
    if (role === "USER" && user.role === "USER") {
      return res.status(400).json({
        message: "User is already a regular User",
      });
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.json({
      message: `User role updated to ${role} successfully`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Update user role error:", error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
