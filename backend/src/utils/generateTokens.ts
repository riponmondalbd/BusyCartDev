import jwt from "jsonwebtoken";

export const generateAccessToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign(
    { id },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }, // long live
  );
};
