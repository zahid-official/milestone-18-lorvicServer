import AppError from "../../errors/AppError";
import { httpStatus } from "../../import";
import QueryBuilder from "../../utils/queryBuilder";
import Admin from "../admin/admin.model";
import Customer from "../customer/customer.model";
import Vendor from "../vendor/vendor.model";
import { IUser, Role } from "./user.interface";
import User from "./user.model";

// Get all users
const getAllUsers = async (query: Record<string, string>) => {
  // Define searchable fields
  const searchFields = ["role", "email"];

  // Build the query using QueryBuilder class and fetch users
  const queryBuilder = new QueryBuilder<IUser>(
    User.find({ isDeleted: { $ne: true } }).populate([
      {
        path: "admin",
        match: { isDeleted: { $ne: true } },
        select: ["name", "email", "phone", "address", "profilePhoto"],
      },
      {
        path: "vendor",
        match: { isDeleted: { $ne: true } },
        select: ["name", "email", "phone", "address", "profilePhoto"],
      },
      {
        path: "customer",
        match: { isDeleted: { $ne: true } },
        select: ["name", "email", "phone", "address", "profilePhoto"],
      },
    ]),
    query
  );
  const users = await queryBuilder
    .sort()
    .filter()
    .paginate()
    .fieldSelect()
    .search(searchFields)
    .build()
    .select("-password");

  // Get meta data for pagination
  const meta = await queryBuilder.meta();

  return {
    data: users,
    meta,
  };
};

// Get all deleted users
const getAllDeletedUsers = async (query: Record<string, string>) => {
  const searchFields = ["role", "email"];

  const queryBuilder = new QueryBuilder<IUser>(
    User.find({ isDeleted: true }).populate([
      {
        path: "admin",
        match: { isDeleted: { $ne: true } },
        select: ["name", "email", "phone", "address", "profilePhoto"],
      },
      {
        path: "vendor",
        match: { isDeleted: { $ne: true } },
        select: ["name", "email", "phone", "address", "profilePhoto"],
      },
      {
        path: "customer",
        match: { isDeleted: { $ne: true } },
        select: ["name", "email", "phone", "address", "profilePhoto"],
      },
    ]),
    query
  );
  const users = await queryBuilder
    .sort()
    .filter()
    .paginate()
    .fieldSelect()
    .search(searchFields)
    .build()
    .select("-password");

  const meta = await queryBuilder.meta();

  return {
    data: users,
    meta,
  };
};

// Get single user
const getSingleUser = async (id: string) => {
  const user = await User.findById(id)
    .where({ isDeleted: { $ne: true } })
    .select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

// Get profile info
const getProfileInfo = async (userId: string, userRole: string) => {
  switch (userRole) {
    case Role.ADMIN: {
      return await Admin.findOne({ userId }).populate({
        path: "userId",
        select: ["_id", "role", "status", "needChangePassword"],
      });
    }

    case Role.VENDOR: {
      return await Vendor.findOne({ userId }).populate({
        path: "userId",
        select: ["_id", "role", "status", "needChangePassword"],
      });
    }

    case Role.CUSTOMER: {
      return await Customer.findOne({ userId }).populate({
        path: "userId",
        select: ["_id", "role", "status", "needChangePassword"],
      });
    }

    default:
      return null;
  }
};

// Update profile info
const updateProfileInfo = async (
  userId: string,
  userRole: string,
  payload: any
) => {
  switch (userRole) {
    case Role.ADMIN: {
      return await Admin.findOneAndUpdate({ userId }, payload, {
        new: true,
        runValidators: true,
      }).populate({
        path: "userId",
        select: ["_id", "role", "status", "needChangePassword"],
      });
    }

    case Role.VENDOR: {
      return await Vendor.findOneAndUpdate({ userId }, payload, {
        new: true,
        runValidators: true,
      }).populate({
        path: "userId",
        select: ["_id", "role", "status", "needChangePassword"],
      });
    }

    case Role.CUSTOMER: {
      return await Customer.findOneAndUpdate({ userId }, payload, {
        new: true,
        runValidators: true,
      }).populate({
        path: "userId",
        select: ["_id", "role", "status", "needChangePassword"],
      });
    }

    default:
      return null;
  }
};

// User service object
const UserService = {
  getAllUsers,
  getAllDeletedUsers,
  getSingleUser,
  getProfileInfo,
  updateProfileInfo,
};

export default UserService;
