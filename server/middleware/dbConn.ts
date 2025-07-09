import mongoose, { type Mongoose } from "mongoose";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1_000;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDb(): Promise<Mongoose> {
  if (cached.conn) {
    console.log("Using cached MongoDB connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    const runtimeConfig = useRuntimeConfig();
    const mongoUri = runtimeConfig.mongodbUri;

    if (!mongoUri) {
      throw new Error("MongoDB URI is not defined in runtime config.");
    }

    console.log("Creating new MongoDB connection.");
    cached.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10_000,
        socketTimeoutMS: 10_000,
        maxPoolSize: 5,
      })
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default defineEventHandler(async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await connectToDb();
      return;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt} of ${MAX_RETRIES} failed.`
      );

      if (attempt === MAX_RETRIES) {
        console.error(
          "🆘 All MongoDB connection attempts failed. Server will not start correctly.",
          error
        );
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
});
