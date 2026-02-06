import { model, Schema } from "mongoose";
import { IOrder, OrderStatus } from "./order.interface";
import { PaymentStatus } from "../payment/payment.interface";

// Mongoose schema for order model
const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },
    couponCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
    },
  },
  { versionKey: false, timestamps: true }
);

// Create mongoose model from order schema
const Order = model<IOrder>("Order", orderSchema);
export default Order;
