import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import { httpStatus } from "../../import";
import QueryBuilder from "../../utils/queryBuilder";
import { Role } from "../user/user.interface";
import Vendor from "../vendor/vendor.model";
import {
  CouponDiscountType,
  CouponScope,
  ICoupon,
} from "./coupon.interface";
import Coupon from "./coupon.model";

type CouponInput = Omit<
  ICoupon,
  "createdBy" | "usedCount" | "scope" | "vendorId" | "isDeleted" | "createdAt" | "isActive"
> & {
  startDate: string | Date;
  endDate: string | Date;
  isActive?: boolean;
};

type CouponUpdatePayload = Partial<CouponInput>;

const normalizeCode = (code: string) => code.trim().toUpperCase();

const resolveDate = (value: string | Date, label: string) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(httpStatus.BAD_REQUEST, `${label} is invalid`);
  }
  return date;
};

const assertDateRange = (startDate: Date, endDate: Date) => {
  if (endDate.getTime() < startDate.getTime()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date must be on or after the start date"
    );
  }
};

const validateDiscount = (
  discountType: CouponDiscountType,
  discountValue: number
) => {
  if (discountValue <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Discount value must be greater than 0"
    );
  }

  if (
    discountType === CouponDiscountType.PERCENTAGE &&
    discountValue > 100
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Percentage discount cannot exceed 100"
    );
  }
};

const getVendorForUser = async (userId: string) => {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Vendor not found or unauthorized"
    );
  }
  return vendor;
};

const getCouponForRole = async (
  couponId: string,
  userId: string,
  role: Role
) => {
  if (role === Role.ADMIN) {
    return Coupon.findOne({ _id: couponId, isDeleted: { $ne: true } });
  }

  const vendor = await getVendorForUser(userId);
  return Coupon.findOne({
    _id: couponId,
    vendorId: vendor._id,
    isDeleted: { $ne: true },
  });
};

// Get all coupons
const getAllCoupons = async (
  userId: string,
  role: Role,
  query: Record<string, string>
) => {
  const searchFields = ["code", "title"];

  let baseQuery = Coupon.find({ isDeleted: { $ne: true } });
  if (role === Role.VENDOR) {
    const vendor = await getVendorForUser(userId);
    baseQuery = Coupon.find({
      isDeleted: { $ne: true },
      vendorId: vendor._id,
    });
  }

  const queryBuilder = new QueryBuilder<ICoupon>(baseQuery, query);
  const coupons = await queryBuilder
    .sort()
    .filter()
    .paginate()
    .fieldSelect()
    .search(searchFields)
    .build();

  const meta = await queryBuilder.meta();

  return {
    data: coupons,
    meta,
  };
};

// Get available coupons for customers
const getAvailableCoupons = async (query: Record<string, string>) => {
  const searchFields = ["code", "title"];
  const now = new Date();
  const baseConditions = {
    isDeleted: { $ne: true },
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  };

  const sanitizedQuery = { ...query };
  const vendorId = sanitizedQuery.vendorId;
  if (vendorId) {
    delete sanitizedQuery.vendorId;
  }

  let baseQuery = Coupon.find(baseConditions);
  if (vendorId) {
    baseQuery = Coupon.find({
      ...baseConditions,
      $or: [
        { scope: CouponScope.GLOBAL },
        { scope: CouponScope.VENDOR, vendorId },
      ],
    });
  }

  const queryBuilder = new QueryBuilder<ICoupon>(baseQuery, sanitizedQuery);
  const coupons = await queryBuilder
    .sort()
    .filter()
    .paginate()
    .fieldSelect()
    .search(searchFields)
    .build();

  const meta = await queryBuilder.meta();

  return {
    data: coupons,
    meta,
  };
};

// Get single coupon
const getSingleCoupon = async (couponId: string, userId: string, role: Role) => {
  const coupon = await getCouponForRole(couponId, userId, role);
  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }
  return coupon;
};

// Create coupon
const createCoupon = async (
  payload: CouponInput,
  userId: string,
  role: Role
) => {
  if (role !== Role.ADMIN && role !== Role.VENDOR) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to create coupons"
    );
  }

  const code = normalizeCode(payload.code);
  const existingCoupon = await Coupon.findOne({
    code,
    isDeleted: { $ne: true },
  });
  if (existingCoupon) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Coupon code '${code}' already exists`
    );
  }

  const startDate = resolveDate(payload.startDate, "Start date");
  const endDate = resolveDate(payload.endDate, "End date");
  assertDateRange(startDate, endDate);
  validateDiscount(payload.discountType, payload.discountValue);

  const couponData: Partial<ICoupon> = {
    ...payload,
    code,
    startDate,
    endDate,
    createdBy: new mongoose.Types.ObjectId(userId),
    scope: CouponScope.GLOBAL,
  };

  if (role === Role.VENDOR) {
    const vendor = await getVendorForUser(userId);
    couponData.vendorId = vendor._id;
    couponData.scope = CouponScope.VENDOR;
  }

  const result = await Coupon.create(couponData);
  return result;
};

// Update coupon
const updateCoupon = async (
  couponId: string,
  userId: string,
  role: Role,
  payload: CouponUpdatePayload
) => {
  const coupon = await getCouponForRole(couponId, userId, role);
  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }
  if (coupon.scope === CouponScope.GLOBAL) {
    if (role !== Role.ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update this coupon"
      );
    }
  } else {
    if (role !== Role.VENDOR || coupon.createdBy.toString() !== userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update this coupon"
      );
    }
  }

  const updates: Partial<ICoupon> = { ...payload };

  if (payload.code) {
    const normalizedCode = normalizeCode(payload.code);
    if (normalizedCode !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        _id: { $ne: coupon._id },
        code: normalizedCode,
        isDeleted: { $ne: true },
      });
      if (existingCoupon) {
        throw new AppError(
          httpStatus.CONFLICT,
          `Coupon code '${normalizedCode}' already exists`
        );
      }
    }
    updates.code = normalizedCode;
  }

  if (payload.startDate) {
    updates.startDate = resolveDate(payload.startDate, "Start date");
  }
  if (payload.endDate) {
    updates.endDate = resolveDate(payload.endDate, "End date");
  }

  const startDate = (updates.startDate ?? coupon.startDate) as Date;
  const endDate = (updates.endDate ?? coupon.endDate) as Date;
  assertDateRange(startDate, endDate);

  if (payload.discountType || payload.discountValue) {
    const discountType = (updates.discountType ??
      coupon.discountType) as CouponDiscountType;
    const discountValue =
      updates.discountValue ?? coupon.discountValue;
    validateDiscount(discountType, discountValue);
  }

  if (updates.usageLimit && coupon.usedCount > updates.usageLimit) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Usage limit cannot be lower than the current usage count"
    );
  }

  delete updates.createdBy;
  delete updates.usedCount;
  delete updates.scope;
  delete updates.vendorId;
  delete updates.isDeleted;

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    coupon._id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  return updatedCoupon;
};

// Delete coupon
const deleteCoupon = async (couponId: string, userId: string, role: Role) => {
  const coupon = await getCouponForRole(couponId, userId, role);
  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  coupon.isDeleted = true;
  await coupon.save();

  return coupon;
};

// Coupon service object
const CouponService = {
  getAllCoupons,
  getAvailableCoupons,
  getSingleCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};

export default CouponService;
