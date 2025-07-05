import mongoose from "mongoose";

let isConnecting = false;
let isConnected = false;

export default defineNitroPlugin(async () => {
  if (mongoose.connection.readyState !== 0) {
    return;
  }

  const runtimeConfig = useRuntimeConfig();

  if (isConnected || isConnecting) {
    return;
  }

  try {
    const mongoUri = runtimeConfig.mongodbUri;
    isConnecting = true;
    await mongoose.connect(mongoUri);
    isConnecting = false;
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
});
