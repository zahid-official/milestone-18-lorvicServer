import { model, Schema } from "mongoose";
import { IPayment, PaymentStatus } from "./payment.interface";

// Mongoose schema for payment model
const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    invoiceUrl: { type: String },
    paymentURL: { type: String },
    paymentGateway: { type: Schema.Types.Mixed },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
    },
  },
  { versionKey: false, timestamps: true }
);

// Create mongoose model from payment schema
const Payment = model<IPayment>("Payment", paymentSchema);
export default Payment;
