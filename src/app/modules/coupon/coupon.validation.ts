import { z } from "zod";
import { CouponDiscountType } from "./coupon.interface";

// Zod schema for creating a coupon
const createCouponSchema = z.object({
  // Code
  code: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Coupon code is required"
          : "Coupon code must be a string",
    })
    .min(3, { error: "Coupon code must be at least 3 characters long." })
    .max(50, { error: "Coupon code cannot exceed 50 characters." })
    .trim(),

  // Title
  title: z
    .string({ error: "Title must be a string" })
    .max(100, { error: "Title cannot exceed 100 characters." })
    .trim()
    .optional(),

  // Description
  description: z
    .string({ error: "Description must be a string" })
    .max(500, { error: "Description cannot exceed 500 characters." })
    .trim()
    .optional(),

  // Discount type
  discountType: z.enum(Object.values(CouponDiscountType) as [string]),

  // Discount value
  discountValue: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Discount value is required"
          : "Discount value must be a number",
    })
    .positive({ error: "Discount value must be greater than 0." }),

  // Max discount
  maxDiscount: z
    .number({ error: "Max discount must be a number" })
    .nonnegative({ error: "Max discount cannot be negative." })
    .optional(),

  // Minimum order amount
  minOrderAmount: z
    .number({ error: "Minimum order amount must be a number" })
    .nonnegative({ error: "Minimum order amount cannot be negative." })
    .optional(),

  // Minimum quantity
  minQuantity: z
    .number({ error: "Minimum quantity must be a number" })
    .int({ error: "Minimum quantity must be an integer." })
    .min(1, { error: "Minimum quantity must be at least 1." })
    .optional(),

  // Duration
  startDate: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Start date is required"
          : "Start date must be a string",
    })
    .trim(),
  endDate: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "End date is required"
          : "End date must be a string",
    })
    .trim(),

  // Status
  isActive: z.boolean().optional(),

  // Usage limit
  usageLimit: z
    .number({ error: "Usage limit must be a number" })
    .int({ error: "Usage limit must be an integer." })
    .min(1, { error: "Usage limit must be at least 1." })
    .optional(),
});

// Zod schema for updating a coupon (all fields optional)
const updateCouponSchema = createCouponSchema.partial();

export { createCouponSchema, updateCouponSchema };
