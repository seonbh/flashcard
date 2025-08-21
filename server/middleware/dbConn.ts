import mongoose, { type Mongoose } from "mongoose";

declare global {
  var __mongoCache:
    | { conn: Mongoose | null; promise: Promise<Mongoose> | null }
    | undefined;
}
if (!global.__mongoCache) {
  global.__mongoCache = { conn: null, promise: null };
}

function connectOnce(): Promise<Mongoose> {
  if (global.__mongoCache!.conn)
    return Promise.resolve(global.__mongoCache!.conn);

  if (!global.__mongoCache!.promise) {
    global.__mongoCache!.promise = mongoose
      .connect(useRuntimeConfig().mongodbUri, {
        bufferCommands: false,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5_000,
        socketTimeoutMS: 30_000,
      })
      .then((m) => (global.__mongoCache!.conn = m))
      .catch((e) => {
        global.__mongoCache!.promise = null;
        throw e;
      });
  }
  return global.__mongoCache!.promise;
}

export default defineEventHandler(async () => {
  if (mongoose.connection.readyState === 1) return;

  try {
    await connectOnce();
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: "Service Unavailable",
    });
  }
});
