import cloudinary from "../config/cloudinary";
import { prisma } from "../prisma/prisma";

// super admin only
// get all staff members (Admins and Super Admins)
export const getAllAdmins = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// get all standard users
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
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// delete user - super admin only
export const deleteUserBySuperAdmin = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "User id is required" });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

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

// update user role - SUPER_ADMIN only
export const updateUserRole = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate input
    if (!id) return res.status(400).json({ message: "User id is required" });
    if (!role) return res.status(400).json({ message: "Role is required" });

    // Only SUPER_ADMIN can access this route
    if (req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate role (allowed roles to set)
    const validRoles = ["ADMIN", "USER", "SUPER_ADMIN"];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Supported roles: ADMIN, USER, SUPER_ADMIN" });
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent changing own role
    if (user.id === req.user.id) {
      return res
        .status(403)
        .json({ message: "You cannot change your own role" });
    }

    // Prevent demoting another SUPER_ADMIN
    if (user.role === "SUPER_ADMIN") {
      return res
        .status(403)
        .json({ message: "Cannot change role of another SUPER_ADMIN" });
    }

    // If the role is already the same, just return success
    if (user.role === role) {
      return res.json({
        message: `User is already a ${role}`,
        user,
      });
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return res.json({
      message: `User role updated to ${role} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
