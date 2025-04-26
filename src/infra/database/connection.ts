import { connect } from "mongoose";

export const connectMongo = async (uri: string): Promise<void> => {
  await connect(uri, {
    authSource: "admin",
    connectTimeoutMS: 2000,
    serverSelectionTimeoutMS: 2000,
  })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
      console.error("Failed to connect to MongoDB");
      throw err;
    });
};
