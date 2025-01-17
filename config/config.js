import dotenv from "dotenv";

dotenv.config();

const config = {
  MONGO_URI: process.env.MONGO_URI,
  MONGODB_NAME: process.env.MONGODB_NAME,
};

export default config;
