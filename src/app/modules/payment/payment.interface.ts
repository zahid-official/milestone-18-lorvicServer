import { Types } from "mongoose";

// Defines payment status
export enum PaymentStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
  FAILED = "FAILED",
}

// Payment interface definition
export interface IPayment {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  transactionId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  invoiceUrl?: string;
  paymentURL?: string | null;
  paymentGateway?: any;
}
