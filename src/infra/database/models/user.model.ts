import type { User } from "@domain/entities";
import { Document, model, Schema } from "mongoose";

const UserSchema = new Schema<User & Document>(
  {
    _id: { type: String },

    identifier: {
      identityNumber: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, required: true },
    },

    security: {
      emailVerified: { type: Boolean, required: true },
      twoFactorAuth: { type: Boolean, required: true },
      twoFactorSecret: { type: String },
      lastIp: { type: String },
    },

    permissions: [{ type: String }],

    personalInfo: {
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
      birthdate: { type: Date, required: true },
      nationality: { type: String, required: true },
      gender: { type: String },
    },

    address: {
      region: { type: String },
      postalCode: { type: String },
      city: { type: String },
      address: { type: String },
    },

    experience: {
      investmentExperience: {
        type: String,
      },
      riskTolerance: {
        type: String,
      },
    },

    logs: {
      lastLogin: { type: Date },
      createdAt: { type: Date, required: true },
      updatedAt: { type: Date, required: true },
      deletedAt: { type: Date },
    },
  },
  {
    timestamps: false,
  },
);

export const userModel = model("User", UserSchema);
