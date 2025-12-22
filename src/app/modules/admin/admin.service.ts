import mongoose from "mongoose";
import envVars from "../../config/env";
import AppError from "../../errors/AppError";
import { bcryptjs, httpStatus } from "../../import";
import QueryBuilder from "../../utils/queryBuilder";
import { Role } from "../user/user.interface";
import User from "../user/user.model";
import { deleteUserById } from "../user/user.utils";
import { IAdmin } from "./admin.interface";
import Admin from "./admin.model";

// Get all admins
const getAllAdmins = async (query: Record<string, string>) => {
  // Define searchable fields
  const searchFields = ["name", "email", "phone"];

  // Build the query using QueryBuilder class and fetch users
  const queryBuilder = new QueryBuilder<IAdmin>(
    Admin.find({ isDeleted: { $ne: true } }),
    query
  );
  const admins = await queryBuilder
    .sort()
    .filter()
    .paginate()
    .fieldSelect()
    .search(searchFields)
    .build();

  // Get meta data for pagination
  const meta = await queryBuilder.meta();

  return {
    data: admins,
    meta,
  };
};

// Get single admin
const getSingleAdmin = async (id: string) => {
  const admin = await Admin.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }
  return admin;
};

// Create admin
const createAdmin = async (payload: IAdmin, password: string) => {
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
        [{ email: payload.email, password: hashedPassword, role: Role.ADMIN }],
        { session }
      );

      // Create admin linked to user
      const [admin] = await Admin.create([{ ...payload, userId: user._id }], {
        session,
      });

      return admin;
    });
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create admin"
    );
  } finally {
    await session.endSession();
  }
};

// Delete admin
const deleteAdmin = async (id: string, userId: string) => {
  const admin = await Admin.findById(id);
  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  return await deleteUserById(admin.userId.toString(), {
    requestingUserId: userId,
  });
};

// Admin service object
const AdminService = {
  getAllAdmins,
  getSingleAdmin,
  createAdmin,
  deleteAdmin,
};

export default AdminService;
