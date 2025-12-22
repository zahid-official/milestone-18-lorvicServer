import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import { httpStatus } from "../../import";
import Admin from "../admin/admin.model";
import Customer from "../customer/customer.model";
import Vendor from "../vendor/vendor.model";
import { Role } from "./user.interface";
import User from "./user.model";

interface DeleteUserOptions {
  requestingUserId?: string;
}

const softDeleteProfileAndUser = async (
  model: mongoose.Model<any>,
  userId: string,
  label: string,
  session: mongoose.ClientSession
) => {
  const profile = await model.findOne({ userId }).session(session);
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, `${label} not found`);
  }

  if (profile.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, `${label} already deleted`);
  }

  const updatedProfile = await model.findByIdAndUpdate(
    profile._id,
    { isDeleted: true },
    { new: true, session }
  );

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true, session }
  );
  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, "Linked user not found");
  }

  return updatedProfile;
};

const deleteUserById = async (
  userId: string,
  options: DeleteUserOptions = {}
) => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }

      if (options.requestingUserId && options.requestingUserId === userId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You cannot delete your own admin account"
        );
      }

      switch (user.role) {
        case Role.ADMIN:
          return await softDeleteProfileAndUser(
            Admin,
            userId,
            "Admin",
            session
          );
        case Role.VENDOR:
          return await softDeleteProfileAndUser(
            Vendor,
            userId,
            "Vendor",
            session
          );
        case Role.CUSTOMER:
          return await softDeleteProfileAndUser(
            Customer,
            userId,
            "Customer",
            session
          );
        default:
          throw new AppError(httpStatus.BAD_REQUEST, "Invalid user role");
      }
    });
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to delete user"
    );
  } finally {
    await session.endSession();
  }
};

export { deleteUserById };
