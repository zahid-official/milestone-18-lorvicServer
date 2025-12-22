import AppError from "../../errors/AppError";
import { httpStatus } from "../../import";
import QueryBuilder from "../../utils/queryBuilder";
import Admin from "../admin/admin.model";
import Customer from "../customer/customer.model";
import Vendor from "../vendor/vendor.model";
import { IUser, Role } from "./user.interface";
import User from "./user.model";
import { deleteUserById } from "./user.utils";

const buildUserSearchFilter = async (searchTerm?: string) => {
  if (!searchTerm || !searchTerm.trim()) {
    return {};
  }

  const regex = new RegExp(searchTerm, "i");
  const profileMatch = {
    isDeleted: { $ne: true },
    $or: [
      { name: regex },
      { email: regex },
      { phone: regex },
      { address: regex },
    ],
  };

  const [admins, vendors, customers] = await Promise.all([
    Admin.find(profileMatch).select("userId"),
    Vendor.find(profileMatch).select("userId"),
    Customer.find(profileMatch).select("userId"),
  ]);

  const userIds = new Set<string>();
  admins.forEach((admin) => userIds.add(admin.userId.toString()));
  vendors.forEach((vendor) => userIds.add(vendor.userId.toString()));
  customers.forEach((customer) => userIds.add(customer.userId.toString()));

  const orConditions: Record<string, unknown>[] = [
    { email: { $regex: regex } },
  ];

  if (userIds.size > 0) {
    orConditions.push({ _id: { $in: Array.from(userIds) } });
  }

  return { $or: orConditions };
};

// Get all users
const getAllUsers = async (query: Record<string, string>) => {
  const searchFilter = await buildUserSearchFilter(query?.searchTerm);

  // Build the query using QueryBuilder class and fetch users
  const queryBuilder = new QueryBuilder<IUser>(
    User.find({ isDeleted: { $ne: true }, ...searchFilter }).populate([
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
  const searchFilter = await buildUserSearchFilter(query?.searchTerm);

  const queryBuilder = new QueryBuilder<IUser>(
    User.find({ isDeleted: true, ...searchFilter }).populate([
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

// Delete user by userId
const deleteUser = async (userId: string, requestingUserId?: string) => {
  return await deleteUserById(userId, { requestingUserId });
};

// User service object
const UserService = {
  getAllUsers,
  getAllDeletedUsers,
  getSingleUser,
  getProfileInfo,
  updateProfileInfo,
  deleteUser,
};

export default UserService;
