import mongoose from "mongoose";
import envVars from "../../config/env";
import stripe from "../../config/stripe";
import AppError from "../../errors/AppError";
import { httpStatus } from "../../import";
import QueryBuilder from "../../utils/queryBuilder";
import Customer from "../customer/customer.model";
import { PaymentStatus } from "../payment/payment.interface";
import Payment from "../payment/payment.model";
import Product from "../product/product.model";
import Vendor from "../vendor/vendor.model";
import { IOrder, OrderStatus } from "./order.interface";
import Order from "./order.model";

// Get all orders
const getAllOrders = async (
  vendorUserId: string,
  query: Record<string, string>
) => {
  const searchFields = ["orderStatus", "paymentStatus"];

  // Find vendor by the authenticated user's id
  const vendor = await Vendor.findOne({ userId: vendorUserId });
  if (!vendor) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Vendor not found or unauthorized"
    );
  }

  // Collect product ids that belong to this vendor
  const vendorProductIds = await Product.find({
    vendorId: vendor._id,
  }).distinct("_id");

  const queryBuilder = new QueryBuilder<IOrder>(
    Order.find({ productId: { $in: vendorProductIds } }).populate([
      {
        path: "productId",
        select: [
          "title",
          "price",
          "category",
          "thumbnail",
          "description",
          "specifications",
        ],
      },
      {
        path: "paymentId",
        select: ["transactionId", "paymentURL"],
      },
      {
        path: "userId",
        select: ["email", "role", "status"],
      },
    ]),
    query
  );

  const orders = await queryBuilder
    .sort()
    .filter()
    .paginate()
    .fieldSelect()
    .search(searchFields)
    .build();

  const meta = await queryBuilder.meta();

  return {
    data: orders,
    meta,
  };
};

// Get all orders for a customer
const getAllOrdersByUser = async (
  userId: string,
  query: Record<string, string>
) => {
  const searchFields = ["orderStatus", "paymentStatus"];

  const queryBuilder = new QueryBuilder<IOrder>(
    Order.find({ userId }).populate([
      {
        path: "productId",
        select: [
          "title",
          "price",
          "category",
          "thumbnail",
          "description",
          "specifications",
        ],
      },
      {
        path: "paymentId",
        select: ["transactionId", "paymentURL"],
      },
      {
        path: "userId",
        select: ["email", "role", "status"],
      },
    ]),
    query
  );
  const orders = await queryBuilder
    .sort()
    .filter()
    .paginate()
    .fieldSelect()
    .search(searchFields)
    .build();

  const meta = await queryBuilder.meta();

  return {
    data: orders,
    meta,
  };
};

// Get single order
const getSingleOrder = async (orderId: string, vendorUserId: string) => {
  const vendor = await Vendor.findOne({ userId: vendorUserId });
  if (!vendor) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Vendor not found or unauthorized"
    );
  }

  const order = await Order.findById(orderId).populate([
    {
      path: "productId",
      select: [
        "title",
        "price",
        "category",
        "thumbnail",
        "vendorId",
        "description",
        "specifications",
      ],
    },
    {
      path: "paymentId",
      select: ["transactionId", "paymentURL"],
    },
    { path: "userId", select: ["email", "role", "status"] },
  ]);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const product: any = order.productId;
  if (!product || product.vendorId?.toString() !== vendor._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view this order"
    );
  }

  return order;
};

// Get single order for customer
const getSingleOrderForUser = async (orderId: string, userId: string) => {
  const order = await Order.findOne({ _id: orderId, userId }).populate([
    {
      path: "productId",
      select: [
        "title",
        "price",
        "category",
        "thumbnail",
        "description",
        "specifications",
      ],
    },
    {
      path: "paymentId",
      select: ["transactionId", "paymentURL"],
    },
    { path: "userId", select: ["email", "role", "status"] },
  ]);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return order;
};

// Create order and deduct product stock
const createOrder = async (payload: IOrder, userId: string) => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      // Check if user has phone and address
      const customer = await Customer.findOne({ userId }).session(session);
      if (!customer?.phone || !customer?.address) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Please update your profile with phone number and address before placing an order"
        );
      }

      // Check if product exists
      const product = await Product.findById(payload.productId).session(
        session
      );
      if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, "Product not found");
      }

      // Check if product already ordered by user and payment status is unpaid
      const existingOrder = await Order.findOne({
        productId: payload.productId,
        userId: userId,
        paymentStatus: PaymentStatus.UNPAID,
      }).session(session);

      if (existingOrder) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "You have already ordered this product and the payment is still pending. Please complete the payment before placing a new order or cancel the existing order."
        );
      }

      // Ensure stock availability
      if (payload.quantity > product.stock) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Insufficient stock available"
        );
      }

      // Deduct stock & calculate payable amount
      product.stock -= payload.quantity;
      await product.save({ session });
      const shippingFee = Number(payload.shippingFee ?? 0);
      const productTotal = Number(
        (product?.price * payload.quantity).toFixed(2)
      );
      const amount = Number((productTotal + shippingFee).toFixed(2));

      // Attach userId & amount to order payload
      payload.userId = new mongoose.Types.ObjectId(userId);
      payload.amount = amount;
      payload.shippingFee = shippingFee;

      // Create order
      const [order] = await Order.create([payload], { session });

      // Stage payment record (pending)
      const [payment] = await Payment.create(
        [
          {
            userId: userId,
            orderId: order._id,
            transactionId: `txn_${new mongoose.Types.ObjectId().toString()}`,
            amount,
            paymentStatus: PaymentStatus.UNPAID,
          },
        ],
        { session }
      );

      // Update order
      order.paymentId = payment._id;
      await order.save({ session });

      // Create Stripe Checkout session
      const lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.title,
              description: product.description ?? "Order payment",
            },
            unit_amount: Math.round(product.price * 100), // in cents
          },
          quantity: payload.quantity,
        },
      ];

      if (shippingFee > 0) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: "Shipping Fee",
              description: "Shipping charge",
            },
            unit_amount: Math.round(shippingFee * 100),
          },
          quantity: 1,
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: customer.email,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
        line_items: lineItems,
        metadata: {
          orderId: order._id.toString(),
          paymentId: payment._id.toString(),
          productId: payload.productId.toString(),
          userId: userId.toString(),
          quantity: payload.quantity.toString(),
          shippingFee: shippingFee.toString(),
        },
        success_url: `${envVars.STRIPE.SUCCESS_FRONTEND_URL}?order_id=${order._id.toString()}`,
        cancel_url: envVars.STRIPE.CANCELED_FRONTEND_URL,
      });

      // Persist Stripe session details on payment
      payment.transactionId = checkoutSession.id;
      payment.paymentURL = checkoutSession.url;
      payment.paymentGateway = checkoutSession;
      await payment.save({ session });

      return {
        order,
        paymentURL: checkoutSession.url,
      };
    });
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create order"
    );
  } finally {
    await session.endSession();
  }
};

// Cancel order and restock product
const cancelOrder = async (orderId: string, userId: string) => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      // Find order
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, "Order not found");
      }

      // Ensure user owns the order
      if (order.userId.toString() !== userId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not authorized to cancel this order"
        );
      }

      // Prevent canceling paid or already canceled orders
      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Cannot cancel a paid order"
        );
      }
      if (order.orderStatus === OrderStatus.CANCELLED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Order already cancelled");
      }

      // Restock product
      const product = await Product.findById(order.productId).session(session);
      if (product) {
        product.stock += order.quantity;
        await product.save({ session });
      }

      // Update order & payment status
      order.orderStatus = OrderStatus.CANCELLED;
      order.paymentStatus = PaymentStatus.FAILED;
      await order.save({ session });

      if (order.paymentId) {
        await Payment.findByIdAndUpdate(
          order.paymentId,
          { paymentStatus: PaymentStatus.FAILED, paymentURL: null },
          { session }
        );
      }

      return order;
    });
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to cancel order"
    );
  } finally {
    await session.endSession();
  }
};

// Update order status to in-progress (vendor scoped)
const updateOrderStatusToInProgress = async (
  orderId: string,
  vendorUserId: string
) => {
  // Resolve vendor
  const vendor = await Vendor.findOne({ userId: vendorUserId });
  if (!vendor) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Vendor not found or unauthorized"
    );
  }

  // Load order with product to verify ownership
  const order = await Order.findById(orderId).populate("productId");
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const product: any = order.productId;
  if (!product || product.vendorId?.toString() !== vendor._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this order"
    );
  }

  // Prevent duplicate in-progress transition
  if (order.orderStatus === OrderStatus.IN_PROCESSING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Order is already in processing"
    );
  }

  // Only allow transition when payment is paid and order is confirmed
  if (
    order.paymentStatus !== PaymentStatus.PAID ||
    order.orderStatus !== OrderStatus.CONFIRMED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Order must be paid and confirmed before processing"
    );
  }

  order.orderStatus = OrderStatus.IN_PROCESSING;
  await order.save();
  return order;
};

// Update order status to delivered (vendor scoped)
const updateOrderStatusToDelivered = async (
  orderId: string,
  vendorUserId: string
) => {
  // Resolve vendor
  const vendor = await Vendor.findOne({ userId: vendorUserId });
  if (!vendor) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Vendor not found or unauthorized"
    );
  }

  // Load order with product to verify ownership
  const order = await Order.findById(orderId).populate("productId");
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const product: any = order.productId;
  if (!product || product.vendorId?.toString() !== vendor._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this order"
    );
  }

  // Prevent duplicate delivered transition
  if (order.orderStatus === OrderStatus.DELIVERED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Order is already delivered");
  }

  // Only allow transition when currently in processing
  if (order.orderStatus !== OrderStatus.IN_PROCESSING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Order must be in processing before it can be delivered"
    );
  }

  order.orderStatus = OrderStatus.DELIVERED;
  await order.save();
  return order;
};

// Order service object
const OrderService = {
  getAllOrders,
  getAllOrdersByUser,
  getSingleOrder,
  getSingleOrderForUser,
  createOrder,
  cancelOrder,
  updateOrderStatusToInProgress,
  updateOrderStatusToDelivered,
};

export default OrderService;
