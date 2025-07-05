import mongoose from "mongoose";
import type { Model, Document, Types } from "mongoose";
import dayjs from "dayjs";

export interface IRateLimit extends Document {
  _id: Types.ObjectId;
  key: string;
  expiresAt: Date;
}

export interface IRateLimitModel extends Model<IRateLimit> {
  checkRateLimit(action: string, ip: string): Promise<boolean>;
  setRateLimit(action: string, ip: string, ttlSeconds: number): Promise<void>;
}

const RateLimitSchema = new mongoose.Schema<IRateLimit, IRateLimitModel>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  { versionKey: false }
);

RateLimitSchema.statics.checkRateLimit = async function (
  action: string,
  ip: string
): Promise<boolean> {
  const key = `${action}:${ip}`;
  const existing = await this.findOne({ key });

  if (existing && dayjs(existing.expiresAt).isAfter(dayjs())) {
    return true;
  }

  return false;
};

RateLimitSchema.statics.setRateLimit = async function (
  action: string,
  ip: string,
  ttlSeconds: number
): Promise<void> {
  const key = `${action}:${ip}`;
  const expiresAt = dayjs().add(ttlSeconds, "seconds").toDate();

  await this.findOneAndUpdate({ key }, { key, expiresAt }, { upsert: true });
};

const RateLimitModel =
  (mongoose.models.RateLimit as IRateLimitModel) ??
  mongoose.model<IRateLimit, IRateLimitModel>("RateLimit", RateLimitSchema);

export default RateLimitModel;
