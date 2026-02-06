import { z } from "zod";

// Zod schema for creating an order
const createOrderSchema = z.object({
  // Product Id
  productId: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Product ID is required"
          : "Product ID must be a string",
    })
    .trim(),

  // Quantity
  quantity: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Quantity is required"
          : "Quantity must be a number",
    })
    .int({ error: "Quantity must be an integer." })
    .min(1, { error: "Quantity must be at least 1." }),

  // Shipping
  shippingFee: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Shipping Fee is required"
          : "Shipping Fee must be a number",
    })
    .nonnegative({ error: "Shipping Fee cannot be negative" }),

  // Coupon Code
  couponCode: z
    .string({ error: "Coupon code must be a string" })
    .trim()
    .optional(),
});

export default createOrderSchema;
