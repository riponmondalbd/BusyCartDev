import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export type ValidationSchema = {
  body?: Record<string, any>;
  query?: Record<string, any>;
  params?: Record<string, any>;
};

export const validate =
  (schema: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // If schema has a body check
      if (schema.body) {
        for (const key in schema.body) {
          const rule = schema.body[key];
          const value = req.body[key];

          if (rule.required && (value === undefined || value === null || value === '')) {
            throw new AppError(`${key} is required`, 400);
          }
          
          if (rule.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
            throw new AppError(`${key} must be a valid email`, 400);
          }

          if (rule.minLength && value && String(value).length < rule.minLength) {
            throw new AppError(`${key} must be at least ${rule.minLength} characters`, 400);
          }
          
          // Basic type transformation for numbers if requested
          if (rule.transform === 'number' && value !== undefined) {
             req.body[key] = Number(value);
             if (isNaN(req.body[key])) {
                throw new AppError(`${key} must be a number`, 400);
             }
          }
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
