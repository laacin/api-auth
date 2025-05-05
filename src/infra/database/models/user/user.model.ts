import type { User } from "@domain/entities/user";
import { Document, model, Schema } from "mongoose";
import {
  userAddressSubSchema,
  userIdentifierSubSchema,
  userProfileSubSchema,
  userSecuritySubSchema,
} from "./sub-schemas.model";
import { logSubSchema } from "./common.schema";

type UserDocument = User & Document;

const UserSchema = new Schema<UserDocument>(
  {
    _id: { type: String },

    identifier: { type: userIdentifierSubSchema, required: true },

    security: { type: userSecuritySubSchema, required: true },

    permissions: [{ type: String }],

    profile: { type: userProfileSubSchema, required: true },

    address: { type: userAddressSubSchema, required: true },

    logs: { type: logSubSchema, required: true },
  },
  {
    timestamps: false,
  },
);

export const userModel = model("User", UserSchema);
