import mongoose from "mongoose";
import envVars from "../../config/env";
import AppError from "../../errors/AppError";
import { bcryptjs, httpStatus } from "../../import";
import QueryBuilder from "../../utils/queryBuilder";
import { Role } from "../user/user.interface";
import User from "../user/user.model";
import { deleteUserById } from "../user/user.utils";
import { IVendor } from "./vendor.interface";
import Vendor from "./vendor.model";

// Get all vendors
const getAllVendors = async (query: Record<string, string>) => {
  const searchFields = ["name", "email", "phone"];

  // Build the query using QueryBuilder and fetch vendors
  const queryBuilder = new QueryBuilder<IVendor>(
    Vendor.find({ isDeleted: { $ne: true } }),
    query
  );
  const vendors = await queryBuilder
    .sort()
    .filter()
    .paginate()
    .fieldSelect()
    .search(searchFields)
    .build();

  const meta = await queryBuilder.meta();

  return {
    data: vendors,
    meta,
  };
};

// Get single vendor
const getSingleVendor = async (id: string) => {
  const vendor = await Vendor.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
  }
  return vendor;
};

// Create vendor
const createVendor = async (payload: IVendor, password: string) => {
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
            role: Role.VENDOR,
          },
        ],
        { session }
      );

      // Create vendor linked to user
      const [vendor] = await Vendor.create([{ ...payload, userId: user._id }], {
        session,
      });

      return vendor;
    });
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create vendor"
    );
  } finally {
    await session.endSession();
  }
};

// Delete vendor
const deleteVendor = async (id: string) => {
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
  }

  return await deleteUserById(vendor.userId.toString());
};

// Vendor service object
const VendorService = {
  getAllVendors,
  getSingleVendor,
  createVendor,
  deleteVendor,
};

export default VendorService;
