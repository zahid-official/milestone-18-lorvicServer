import { Request, Response } from "express";
import { httpStatus } from "../../import";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Role } from "../user/user.interface";
import OrderService from "./order.service";

// Get all orders
const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const query = req?.query;
  const userId = req?.decodedToken?.userId;
  const userRole = req?.decodedToken?.role as Role;
  const result = await OrderService.getAllOrders(
    userId,
    userRole,
    query as Record<string, string>
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All orders retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Get all orders (for the logged-in customer)
const getAllOrdersByUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req?.decodedToken?.userId;
  const query = req?.query;
  const result = await OrderService.getAllOrdersByUser(
    userId,
    query as Record<string, string>
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All orders retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Get single order
const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const orderId = req?.params?.id;
  const userId = req?.decodedToken?.userId;
  const userRole = req?.decodedToken?.role as Role;
  const result = await OrderService.getSingleOrder(
    orderId,
    userId,
    userRole
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order retrieved successfully",
    data: result,
  });
});

// Get single order (for the logged-in customer)
const getSingleOrderForUser = catchAsync(
  async (req: Request, res: Response) => {
    const orderId = req?.params?.id;
    const userId = req?.decodedToken?.userId;
    const result = await OrderService.getSingleOrderForUser(orderId, userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Order retrieved successfully",
      data: result,
    });
  }
);

// Create order
const createOrder = catchAsync(async (req: Request, res: Response) => {
  const body = req?.body;
  const userId = req?.decodedToken?.userId;
  const result = await OrderService.createOrder(body, userId);

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message:
      "Order created successfully. Complete the Stripe payment to confirm.",
    data: result,
  });
});

// Cancel order
const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const orderId = req?.params?.id;
  const userId = req?.decodedToken?.userId;

  const result = await OrderService.cancelOrder(orderId, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order cancelled successfully",
    data: result,
  });
});

// Mark order in-progress (vendor only)
const updateOrderStatusToInProgress = catchAsync(
  async (req: Request, res: Response) => {
    const orderId = req?.params?.id;
    const vendorUserId = req?.decodedToken?.userId;

    const result = await OrderService.updateOrderStatusToInProgress(
      orderId,
      vendorUserId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Order marked as in-progress",
      data: result,
    });
  }
);

// Mark order delivered (vendor only)
const updateOrderStatusToDelivered = catchAsync(
  async (req: Request, res: Response) => {
    const orderId = req?.params?.id;
    const vendorUserId = req?.decodedToken?.userId;

    const result = await OrderService.updateOrderStatusToDelivered(
      orderId,
      vendorUserId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Order marked as delivered",
      data: result,
    });
  }
);

// Order controller object
const OrderController = {
  getAllOrders,
  getAllOrdersByUser,
  getSingleOrder,
  getSingleOrderForUser,
  createOrder,
  cancelOrder,
  updateOrderStatusToInProgress,
  updateOrderStatusToDelivered,
};

export default OrderController;
