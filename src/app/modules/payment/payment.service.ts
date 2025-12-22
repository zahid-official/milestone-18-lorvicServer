import Stripe from "stripe";
import { PaymentStatus } from "./payment.interface";
import Payment from "./payment.model";
import Order from "../order/order.model";
import { OrderStatus } from "../order/order.interface";
import Product from "../product/product.model";
import mongoose from "mongoose";

// Create payment
const stripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    // Handle completed checkout session
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      const orderId = session.metadata?.orderId;

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      const paymentStatus =
        session.payment_status === "paid"
          ? PaymentStatus.PAID
          : PaymentStatus.UNPAID;

      // Update payment + order on successful charge
      const mongoSession = await mongoose.startSession();
      await mongoSession.withTransaction(async () => {
        if (paymentId) {
          await Payment.findByIdAndUpdate(
            paymentId,
            {
              transactionId: paymentIntentId ?? session.id,
              paymentGateway: session,
              paymentURL: null,
              paymentStatus,
            },
            { session: mongoSession }
          );
        }

        if (orderId) {
          await Order.findByIdAndUpdate(
            orderId,
            {
              paymentId,
              paymentStatus,
              orderStatus:
                paymentStatus === PaymentStatus.PAID
                  ? OrderStatus.CONFIRMED
                  : OrderStatus.PENDING,
            },
            { session: mongoSession }
          );
        }
      });
      await mongoSession.endSession();
      break;
    }

    // Handle expired checkout session
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      const orderId = session.metadata?.orderId;

      // Mark payment/order as failed and restore stock with guard
      const mongoSession = await mongoose.startSession();
      await mongoSession.withTransaction(async () => {
        // Load order to check current state
        const order = orderId
          ? await Order.findById(orderId).session(mongoSession)
          : null;
        if (!order) return;

        // Skip if already finalized (cancelled manually or paid)
        if (
          order.orderStatus === OrderStatus.CANCELLED ||
          order.paymentStatus === PaymentStatus.PAID
        ) {
          return;
        }

        // Restore product stock using order data
        const product = await Product.findById(order.productId).session(
          mongoSession
        );
        if (product) {
          product.stock += order.quantity;
          await product.save({ session: mongoSession });
        }

        // Mark order and payment as failed/cancelled
        order.orderStatus = OrderStatus.CANCELLED;
        order.paymentStatus = PaymentStatus.FAILED;
        await order.save({ session: mongoSession });

        if (paymentId) {
          await Payment.findByIdAndUpdate(
            paymentId,
            { paymentStatus: PaymentStatus.FAILED, paymentURL: null },
            { session: mongoSession }
          );
        }
      });
      await mongoSession.endSession();
      break;
    }

    // Handle other event types
    default:
      break;
  }

  return { paymentReceived: true };
};

// payment service object
const PaymentService = {
  stripeWebhook,
};

export default PaymentService;
