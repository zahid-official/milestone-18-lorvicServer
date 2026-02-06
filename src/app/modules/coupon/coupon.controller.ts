import { Request, Response } from "express";
import { httpStatus } from "../../import";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Role } from "../user/user.interface";
import CouponService from "./coupon.service";
import { ICoupon } from "./coupon.interface";

// Get all coupons
const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const query = req?.query;
  const userId = req?.decodedToken?.userId;
  const userRole = req?.decodedToken?.role as Role;
  const result = await CouponService.getAllCoupons(
    userId,
    userRole,
    query as Record<string, string>
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All coupons retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Get available coupons (for customers)
const getAvailableCoupons = catchAsync(async (req: Request, res: Response) => {
  const query = req?.query;
  const result = await CouponService.getAvailableCoupons(
    query as Record<string, string>
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Available coupons retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Get single coupon
const getSingleCoupon = catchAsync(async (req: Request, res: Response) => {
  const couponId = req?.params?.id;
  const userId = req?.decodedToken?.userId;
  const userRole = req?.decodedToken?.role as Role;
  const result = await CouponService.getSingleCoupon(
    couponId,
    userId,
    userRole
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Coupon retrieved successfully",
    data: result,
  });
});

// Create coupon
const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const payload: ICoupon = req?.body;
  const userId = req?.decodedToken?.userId;
  const userRole = req?.decodedToken?.role as Role;
  const result = await CouponService.createCoupon(payload, userId, userRole);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Coupon created successfully",
    data: result,
  });
});

// Update coupon
const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const couponId = req?.params?.id;
  const userId = req?.decodedToken?.userId;
  const userRole = req?.decodedToken?.role as Role;
  const payload: Partial<ICoupon> = req?.body;
  const result = await CouponService.updateCoupon(
    couponId,
    userId,
    userRole,
    payload
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Coupon updated successfully",
    data: result,
  });
});

// Delete coupon
const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const couponId = req?.params?.id;
  const userId = req?.decodedToken?.userId;
  const userRole = req?.decodedToken?.role as Role;
  const result = await CouponService.deleteCoupon(couponId, userId, userRole);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Coupon deleted successfully",
    data: result,
  });
});

// Coupon controller object
const CouponController = {
  getAllCoupons,
  getAvailableCoupons,
  getSingleCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};

export default CouponController;
