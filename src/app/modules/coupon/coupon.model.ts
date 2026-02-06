import { model, Schema } from "mongoose";
import { CouponDiscountType, CouponScope, ICoupon } from "./coupon.interface";

// Mongoose schema for coupon model
const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: { type: String },
    description: { type: String },
    discountType: {
      type: String,
      enum: Object.values(CouponDiscountType),
      required: true,
    },
    discountValue: { type: Number, required: true },
    maxDiscount: { type: Number },
    minOrderAmount: { type: Number },
    minQuantity: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    scope: {
      type: String,
      enum: Object.values(CouponScope),
      default: CouponScope.GLOBAL,
    },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true }
);

// Create mongoose model from coupon schema
const Coupon = model<ICoupon>("Coupon", couponSchema);
export default Coupon;
