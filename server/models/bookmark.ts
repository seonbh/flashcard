import mongoose, { Types } from "mongoose";
import type { Document, Model } from "mongoose";
import type { IUser } from "~/server/models/user";
import type { IFlashcard } from "~/server/models/flashcard";

// 1. 문서(Document) 인터페이스 정의
export interface IBookmark extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser | null;
  flashcard: Types.ObjectId | IFlashcard;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// 2. 모델(Model) 인터페이스 정의 (정적 메서드 타입)
export interface IBookmarkModel extends Model<IBookmark> {
  add(
    userId: Types.ObjectId | string,
    flashcardId: Types.ObjectId | string
  ): Promise<IBookmark>;

  remove(
    userId: Types.ObjectId | string,
    flashcardId: Types.ObjectId | string
  ): Promise<boolean>;

  bookmarked(
    userId: Types.ObjectId | string,
    flashcardId: Types.ObjectId | string
  ): Promise<boolean>;

  findByUser(userId: Types.ObjectId | string): Promise<IBookmark[]>;

  nullifyUser(userId: Types.ObjectId | string): Promise<number>;
  removeByFlashcard(flashcardId: Types.ObjectId | string): Promise<number>;
}

// 3. 스키마(Schema) 정의
const BookmarkSchema = new mongoose.Schema<IBookmark, IBookmarkModel>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    flashcard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flashcard",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 4. 복합 인덱스 (unique 제약 제거)
BookmarkSchema.index({ user: 1, flashcard: 1 });

// 5. 정적(Static) 메서드 구현

// 북마크 추가
BookmarkSchema.statics.add = async function (
  userId: Types.ObjectId | string,
  flashcardId: Types.ObjectId | string
): Promise<IBookmark> {
  const bookmark = new this({
    user: new Types.ObjectId(userId),
    flashcard: new Types.ObjectId(flashcardId),
  });
  await bookmark.save();
  return bookmark;
};

// 북마크 제거
BookmarkSchema.statics.remove = async function (
  userId: Types.ObjectId | string,
  flashcardId: Types.ObjectId | string
): Promise<boolean> {
  const result = await this.deleteOne({
    user: new Types.ObjectId(userId),
    flashcard: new Types.ObjectId(flashcardId),
  });
  return result.deletedCount > 0;
};

// 북마크 존재 여부 확인
BookmarkSchema.statics.bookmarked = async function (
  userId: Types.ObjectId | string,
  flashcardId: Types.ObjectId | string
): Promise<boolean> {
  const bookmark = await this.exists({
    user: new Types.ObjectId(userId),
    flashcard: new Types.ObjectId(flashcardId),
  });
  return !!bookmark;
};

// 사용자의 북마크 목록
BookmarkSchema.statics.findByUser = async function (
  userId: Types.ObjectId | string
): Promise<IBookmark[]> {
  return await this.find({ user: new Types.ObjectId(userId) })
    .populate("flashcard")
    .sort({ createdAt: -1 });
};

// 사용자의 모든 북마크에서 사용자를 null로 변경
BookmarkSchema.statics.nullifyUser = async function (
  userId: Types.ObjectId | string
): Promise<number> {
  const result = await this.updateMany(
    { user: new Types.ObjectId(userId) },
    { $set: { user: null } }
  );
  return result.modifiedCount;
};

// 플래시카드의 모든 북마크 제거
BookmarkSchema.statics.removeByFlashcard = async function (
  flashcardId: Types.ObjectId | string
): Promise<number> {
  const result = await this.deleteMany({
    flashcard: new Types.ObjectId(flashcardId),
  });
  return result.deletedCount;
};

export default BookmarkSchema;
