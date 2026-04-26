import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.string().transform((val) => parseFloat(val)),
    discount: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    stock: z.string().transform((val) => parseInt(val)),
    categoryId: z.string().uuid("Invalid category ID"),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    discount: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    stock: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : undefined)),
    categoryId: z.string().uuid().optional(),
  }),
});
