import mongoose, { type Types, type Document, type Model } from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  password?: string;
  role: "admin" | "staff" | "normal";
  banReason: string | null;
  banDate: Date | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  isBanned: boolean;
}

export interface IUserModel extends Model<IUser> {
  // Statics
  register(name: string, password: string): Promise<IUser>;
  checkExists(_id: Types.ObjectId | string): Promise<boolean>;
  findByNameAndPassword(name: string, password: string): Promise<IUser | null>;
  changePassword(
    id: Types.ObjectId | string,
    oldPassword: string,
    newPassword: string
  ): Promise<void>;
  withdrawal(
    id: Types.ObjectId | string,
    option?: { session?: mongoose.ClientSession }
  ): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 10,
      match: /^[a-zA-Z0-9가-힣]+$/,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "staff", "normal"],
      default: "normal",
    },
    banReason: {
      type: String,
      default: null,
    },
    banDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export class NameDuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NameDuplicateError";
  }
}

// Statics
UserSchema.statics.register = async function (
  name: string,
  password: string
): Promise<IUser> {
  try {
    const user = new this({
      name,
      password: await bcrypt.hash(password, SALT_ROUNDS),
    });

    await user.save();
    return user;
  } catch (error) {
    if (
      !!error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new NameDuplicateError("이미 사용 중인 이름입니다.");
    }
    throw error;
  }
};

UserSchema.statics.checkExists = async function (
  _id: Types.ObjectId | string
): Promise<boolean> {
  const user = await this.exists({
    _id,
    banDate: { $eq: null },
    banReason: { $eq: null },
  });
  return !!user;
};

UserSchema.statics.findByNameAndPassword = async function (
  name: string,
  password: string
): Promise<IUser | null> {
  // return this.findOne({
  //   name,
  //   password: bcrypt.hashSync(password, SALT_ROUNDS),
  // });
  const user = await this.findOne({ name }).select("+password");
  if (!user) {
    return null;
  }
  const isMatch = await bcrypt.compare(password, user.password!);
  if (!isMatch) {
    return null;
  }
  return user;
};

export class NoUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoUserError";
  }
}

export class WrongPassword extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WrongPassword";
  }
}

UserSchema.statics.changePassword = async function (
  id: Types.ObjectId | string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const user = await this.findById(id).select("+password");
  if (!user) {
    throw new NoUserError("사용자를 찾을 수 없습니다.");
  }
  const isValid = await bcrypt.compare(oldPassword, user.password!);
  if (!isValid) {
    throw new WrongPassword("현재 비밀번호가 올바르지 않습니다.");
  }
  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
};

UserSchema.statics.withdrawal = async function (
  id: Types.ObjectId | string,
  option?: { session?: mongoose.ClientSession }
): Promise<boolean> {
  const result = await this.deleteOne({ _id: id }, option);
  return result.deletedCount > 0;
};

// Virtuals
UserSchema.virtual("isBanned").get(function (this: IUser) {
  return !!this.banDate && this.banDate > new Date();
});

export default UserSchema;
