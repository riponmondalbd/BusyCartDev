import { prisma } from "../prisma/prisma";

// get all admins list - super admin only
export const getAllAdmins = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "ADMIN" },
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

// get all users list - super admin only
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
