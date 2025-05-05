import { Schema, type SchemaOptions } from "mongoose";

const opts = { _id: false, timestamps: false } satisfies SchemaOptions;

interface Logs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

const logSubSchema = new Schema<Logs>(
  {
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    deletedAt: { type: Date },
  },
  opts,
);

export { opts, logSubSchema };
