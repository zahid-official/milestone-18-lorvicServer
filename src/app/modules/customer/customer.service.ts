import mongoose from "mongoose";
import envVars from "../../config/env";
import AppError from "../../errors/AppError";
import { bcryptjs, httpStatus } from "../../import";
import User from "../user/user.model";
import { deleteUserById } from "../user/user.utils";
import { ICustomer } from "./customer.interface";
import Customer from "./customer.model";
import QueryBuilder from "../../utils/queryBuilder";

// Get all customers
const getAllCustomers = async (query: Record<string, string>) => {
  const searchFields = ["name", "email", "phone"];

  const queryBuilder = new QueryBuilder<ICustomer>(
    Customer.find({ isDeleted: { $ne: true } }),
    query
  );
  const customers = await queryBuilder
    .sort()
    .filter()
    .paginate()
    .fieldSelect()
    .search(searchFields)
    .build();

  const meta = await queryBuilder.meta();

  return {
    data: customers,
    meta,
  };
};

// Get single customer
const getSingleCustomer = async (id: string) => {
  const customer = await Customer.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });
  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }
  return customer;
};

// Create customer
const createCustomer = async (payload: ICustomer, password: string) => {
  // Block duplicate accounts by email
  const existingUser = await User.findOne({ email: payload?.email });
  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      `An account already exists for '${payload?.email}'. Sign in or use a different email.`
    );
  }

  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      // Hash password
      const hashedPassword = await bcryptjs.hash(
        password,
        envVars.BCRYPT_SALT_ROUNDS
      );

      // Create user
      const [user] = await User.create(
        [
          {
            email: payload.email,
            password: hashedPassword,
            needChangePassword: false,
          },
        ],
        { session }
      );

      // Create customer linked to user
      const [customer] = await Customer.create(
        [{ ...payload, userId: user._id }],
        { session }
      );

      return customer;
    });
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create account"
    );
  } finally {
    await session.endSession();
  }
};

// Delete customer (soft delete customer and linked user)
const deleteCustomer = async (id: string) => {
  const customer = await Customer.findById(id);
  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  return await deleteUserById(customer.userId.toString());
};

// Customer service object
const CustomerService = {
  getAllCustomers,
  getSingleCustomer,
  createCustomer,
  deleteCustomer,
};

export default CustomerService;
