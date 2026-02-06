import { Router } from "express";
import AdminRoutes from "../modules/admin/admin.routes";
import AuthRoutes from "../modules/auth/auth.routes";
import CustomerRoutes from "../modules/customer/customer.routes";
import OrderRoutes from "../modules/order/order.routes";
import ProductRoutes from "../modules/product/product.routes";
import CouponRoutes from "../modules/coupon/coupon.routes";
import UserRoutes from "../modules/user/user.routes";
import VendorRoutes from "../modules/vendor/vendor.routes";

// Initialize main router
const router = Router();

// List of route configs
const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/customer",
    route: CustomerRoutes,
  },
  {
    path: "/vendor",
    route: VendorRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/product",
    route: ProductRoutes,
  },
  {
    path: "/coupon",
    route: CouponRoutes,
  },
  {
    path: "/order",
    route: OrderRoutes,
  },
];

// Register all routes
moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// Export main router
const ModuleRouter = router;
export default ModuleRouter;
