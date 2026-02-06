import { Router } from "express";
import validateSchema from "../../middlewares/validateSchema";
import validateToken from "../../middlewares/validateToken";
import { Role } from "../user/user.interface";
import CouponController from "./coupon.controller";
import { createCouponSchema, updateCouponSchema } from "./coupon.validation";

// Initialize router
const router = Router();

// Get routes
router.get(
  "/",
  validateToken(Role.ADMIN, Role.VENDOR),
  CouponController.getAllCoupons
);
router.get(
  "/available",
  validateToken(Role.CUSTOMER),
  CouponController.getAvailableCoupons
);
router.get(
  "/singleCoupon/:id",
  validateToken(Role.ADMIN, Role.VENDOR),
  CouponController.getSingleCoupon
);

// Post routes
router.post(
  "/create",
  validateToken(Role.ADMIN, Role.VENDOR),
  validateSchema(createCouponSchema),
  CouponController.createCoupon
);

// Patch routes
router.patch(
  "/:id",
  validateToken(Role.ADMIN, Role.VENDOR),
  validateSchema(updateCouponSchema),
  CouponController.updateCoupon
);

// Delete routes
router.delete(
  "/:id",
  validateToken(Role.ADMIN, Role.VENDOR),
  CouponController.deleteCoupon
);

// Export coupon routes
const CouponRoutes = router;
export default CouponRoutes;
