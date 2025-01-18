import mongoose from "mongoose";
import config from "./config.js";

const connectDb = async () => {
  try {
    if (!config.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    const conn = await mongoose.connect(config.MONGO_URI, {
      dbName: config.MONGODB_NAME,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDb;
