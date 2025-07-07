import mongoose from "mongoose";

import FlashcardSchema, {
  type IFlashcard,
  type IFlashcardModel,
} from "~/server/models/flashcard";

import UserSchema, {
  type IUser,
  type IUserModel,
} from "~/server/models/user";

import BookmarkSchema, {
  type IBookmark,
  type IBookmarkModel,
} from "~/server/models/bookmark";

import RateLimitSchema, {
  type IRateLimit,
  type IRateLimitModel,
} from "~/server/models/rateLimit";

export const User =
  (mongoose.models.User as IUserModel) ??
  mongoose.model<IUser, IUserModel>("User", UserSchema);

export const Flashcard =
  (mongoose.models.Flashcard as IFlashcardModel) ??
  mongoose.model<IFlashcard, IFlashcardModel>("Flashcard", FlashcardSchema);

export const Bookmark =
  (mongoose.models.Bookmark as IBookmarkModel) ??
  mongoose.model<IBookmark, IBookmarkModel>("Bookmark", BookmarkSchema);

export const RateLimit =
  (mongoose.models.RateLimit as IRateLimitModel) ??
  mongoose.model<IRateLimit, IRateLimitModel>("RateLimit", RateLimitSchema);
