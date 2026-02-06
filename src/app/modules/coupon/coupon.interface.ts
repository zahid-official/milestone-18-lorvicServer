import { Types } from "mongoose";

// Defines coupon discount type
export enum CouponDiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

// Defines coupon scope
export enum CouponScope {
  GLOBAL = "GLOBAL",
  VENDOR = "VENDOR",
}

// Coupon interface definition
export interface ICoupon {
  code: string;
  title?: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  minQuantity?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  scope: CouponScope;
  vendorId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt?: Date;
}
