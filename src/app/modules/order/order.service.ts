import mongoose from "mongoose";
import type Stripe from "stripe";
import envVars from "../../config/env";
import stripe from "../../config/stripe";
import AppError from "../../errors/AppError";
import { httpStatus } from "../../import";
import QueryBuilder from "../../utils/queryBuilder";
import Customer from "../customer/customer.model";
import { CouponDiscountType, CouponScope } from "../coupon/coupon.interface";
import Coupon from "../coupon/coupon.model";
import { PaymentStatus } from "../payment/payment.interface";
import Payment from "../payment/payment.model";
import Product from "../product/product.model";
import { Role } from "../user/user.interface";
import Vendor from "../vendor/vendor.model";
import { IOrder, OrderStatus } from "./order.interface";
import Order from "./order.model";

// Get all orders
const getAllOrders = async (
  userId: string,
  userRole: Role,
  query: Record<string, string>
) => {
  const searchFields = ["orderStatus", "paymentStatus"];

  const populateFields = [
    {
      path: "userId",
      select: ["email", "role", "status"],
    },
    {
      path: "customerId",
      select: ["name", "email", "phone", "address"],
    },
    {
      path: "vendorId",
      select: ["name", "email"],
    },
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
  ];

  let baseQuery = Order.find().populate(populateFields);

  if (userRole !== Role.ADMIN) {
    // Find vendor by the authenticated user's id
    const vendor = await Vendor.findOne({ userId });
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

    baseQuery = Order.find({ productId: { $in: vendorProductIds } }).populate(
      populateFields
    );
  }

  const queryBuilder = new QueryBuilder<IOrder>(baseQuery, query);

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
const getSingleOrder = async (
  orderId: string,
  userId: string,
  userRole: Role
) => {
  let vendorId: string | null = null;
  if (userRole !== Role.ADMIN) {
    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Vendor not found or unauthorized"
      );
    }
    vendorId = vendor._id.toString();
  }

  const order = await Order.findById(orderId).populate([
    {
      path: "userId",
      select: ["email", "role", "status"],
    },
    {
      path: "customerId",
      select: ["name", "email", "phone", "address"],
    },
    {
      path: "vendorId",
      select: ["name", "email"],
    },
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
  ]);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (userRole === Role.ADMIN) {
    return order;
  }

  const product: any = order.productId;
  if (!product || product.vendorId?.toString() !== vendorId) {
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
      const shippingFeeCents = Math.round(shippingFee * 100);
      const priceCents = Math.round(product.price * 100);
      const productTotalCents = priceCents * payload.quantity;

      let discountCents = 0;
      const couponCode = payload.couponCode?.trim();

      if (couponCode) {
        const normalizedCode = couponCode.toUpperCase();
        const coupon = await Coupon.findOne({
          code: normalizedCode,
          isDeleted: { $ne: true },
        }).session(session);

        if (!coupon || !coupon.isActive) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Invalid or inactive coupon"
          );
        }

        const now = new Date();
        if (now < coupon.startDate) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Coupon is not active yet"
          );
        }
        if (now > coupon.endDate) {
          throw new AppError(httpStatus.BAD_REQUEST, "Coupon has expired");
        }

        if (
          coupon.scope === CouponScope.VENDOR &&
          (!coupon.vendorId ||
            coupon.vendorId.toString() !== product.vendorId.toString())
        ) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Coupon is not valid for this product"
          );
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Coupon usage limit reached"
          );
        }

        if (
          coupon.minOrderAmount &&
          productTotalCents < Math.round(coupon.minOrderAmount * 100)
        ) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Order amount does not meet coupon requirements"
          );
        }

        if (coupon.minQuantity && payload.quantity < coupon.minQuantity) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Order quantity does not meet coupon requirements"
          );
        }

        // Use cents to avoid floating point drift in discount math
        if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
          if (coupon.discountValue <= 0 || coupon.discountValue > 100) {
            throw new AppError(
              httpStatus.BAD_REQUEST,
              "Invalid coupon discount percentage"
            );
          }
          discountCents = Math.round(
            (productTotalCents * coupon.discountValue) / 100
          );
        } else {
          if (coupon.discountValue <= 0) {
            throw new AppError(
              httpStatus.BAD_REQUEST,
              "Invalid coupon discount value"
            );
          }
          discountCents = Math.round(coupon.discountValue * 100);
        }

        if (coupon.maxDiscount) {
          discountCents = Math.min(
            discountCents,
            Math.round(coupon.maxDiscount * 100)
          );
        }

        discountCents = Math.min(discountCents, productTotalCents);
        payload.couponId = coupon._id;
        payload.couponCode = normalizedCode;
      } else {
        payload.couponCode = undefined;
      }

      payload.discountAmount = Number((discountCents / 100).toFixed(2));
      const discountedProductCents = Math.max(
        productTotalCents - discountCents,
        0
      );
      const amountCents = discountedProductCents + shippingFeeCents;
      const amount = Number((amountCents / 100).toFixed(2));

      // Attach userId & amount to order payload
      payload.userId = new mongoose.Types.ObjectId(userId);
      payload.customerId = new mongoose.Types.ObjectId(customer._id);
      payload.vendorId = new mongoose.Types.ObjectId(product.vendorId);
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
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      if (discountedProductCents > 0) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name:
                payload.quantity > 1
                  ? `${product.title} x${payload.quantity}`
                  : product.title,
              description: product.description ?? "Order payment",
            },
            unit_amount: discountedProductCents, // in cents
          },
          quantity: 1,
        });
      }

      if (shippingFeeCents > 0) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: "Shipping Fee",
              description: "Shipping charge",
            },
            unit_amount: shippingFeeCents,
          },
          quantity: 1,
        });
      }

      // Stripe requires at least one positive line item
      if (lineItems.length === 0) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Order total must be greater than zero"
        );
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
          couponCode: payload.couponCode ?? "",
          discountAmount: payload.discountAmount?.toString() ?? "0",
        },
        success_url: `${
          envVars.STRIPE.SUCCESS_FRONTEND_URL
        }?order_id=${order._id.toString()}`,
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
