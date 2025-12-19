import { Types } from "mongoose";
import { PaymentStatus } from "../payment/payment.interface";

// Defines order status
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  IN_PROCESSING = "IN_PROCESSING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

// Order interface definition
export interface IOrder {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  quantity: number;
  amount: number;
  shippingFee: number;
  orderStatus: OrderStatus;
  paymentStatus?: PaymentStatus;
}
