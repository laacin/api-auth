import type {
  TrustedDevice,
  UserAddress,
  UserIdentifier,
  UserProfile,
  UserSecurity,
} from "@domain/entities/user";
import { Schema } from "mongoose";
import { opts } from "./common.schema";

const userIdentifierSubSchema = new Schema<UserIdentifier>(
  {
    email: { type: String, required: true },
    identityNumber: { type: String, required: true },
    password: { type: String, required: true },
  },
  opts,
);

const TrusedDevicesSubSchema = new Schema<TrustedDevice>(
  {
    deviceId: { type: String },
    deviceName: { type: String },
  },
  opts,
);

const userSecuritySubSchema = new Schema<UserSecurity>(
  {
    emailVerified: { type: Boolean, default: false },
    twoFactorAuth: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    lastLogin: { type: Date },
    trustedDevices: { type: [TrusedDevicesSubSchema] },
  },
  opts,
);

const userProfileSubSchema = new Schema<UserProfile>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    birthdate: { type: Date, required: true },
    nationality: { type: String, required: true },
    gender: { type: String },
  },
  opts,
);

const userAddressSubSchema = new Schema<UserAddress>(
  {
    region: { type: String },
    postalCode: { type: String },
    city: { type: String },
    address: { type: String },
  },
  opts,
);

export {
  userIdentifierSubSchema,
  userSecuritySubSchema,
  userProfileSubSchema,
  userAddressSubSchema,
};
