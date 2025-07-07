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
  try {
    await connectToDb();
    console.log("MongoDB connection initialized via Nitro plugin.");
  } catch (error) {
    console.error("MongoDB connection failed in Nitro plugin:", error);

    throw error;
  }
});
