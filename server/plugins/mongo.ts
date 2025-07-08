import mongoose, { type Mongoose } from "mongoose";

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

export default defineNitroPlugin(async () => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1_000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await connectToDb();
      console.log(`✅ MongoDB connection successful on attempt ${attempt}.`);
      // 연결에 성공하면 즉시 함수를 종료합니다.
      return;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt} of ${MAX_RETRIES} failed.`
      );

      if (attempt === MAX_RETRIES) {
        console.error(
          "All MongoDB connection attempts failed. Server will not start correctly.",
          error
        );
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
});
