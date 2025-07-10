import mongoose, { Types, type Document, type Model } from "mongoose";
import type { IUser } from "~/server/models/user";
import type { IBookmark } from "~/server/models/bookmark";

// 1. 문서(Document) 인터페이스 정의
export interface IFlashcard extends Document {
  _id: Types.ObjectId;
  title: string;
  author: Types.ObjectId | IUser | null;
  cards: {
    front: string;
    back: string;
  }[];
  bookmarkCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  bookmarks?: IBookmark[];
}

// 2. 모델(Model) 인터페이스 정의 (정적 메서드 타입)
export interface IFlashcardModel extends Model<IFlashcard> {
  add(
    title: string,
    author: Types.ObjectId | string,
    cards: { front: string; back: string }[]
  ): Promise<IFlashcard>;

  findByAuthor(author: string): Promise<IFlashcard[]>;
  findRecentWithAuthor(
    userId?: string
  ): Promise<(IFlashcard & { isBookmarked?: boolean })[]>;
  findByIds(ids: (string | Types.ObjectId)[]): Promise<IFlashcard[]>;
  searchByTitleWithAuthor(
    query: string,
    userId?: string
  ): Promise<(IFlashcard & { isBookmarked?: boolean })[]>;
  getWithAuthor(
    id: string | Types.ObjectId
  ): Promise<(IFlashcard & { author: IUser | null }) | null>;

  deleteByIdAndAuthor(id: string, author: string): Promise<boolean>;
  nullifyAuthor(author: string): Promise<number>;
}

// 3. 스키마(Schema) 정의
const FlashcardSchema = new mongoose.Schema<IFlashcard, IFlashcardModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
      minlength: 1,
      maxlength: 20,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    cards: {
      type: [
        {
          _id: false,
          front: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 50,
          },
          back: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100,
          },
        },
      ],
      required: true,
      validate: {
        validator: function (cards: { front: string; back: string }[]) {
          return cards.length >= 1 && cards.length <= 5000;
        },
        message: "카드는 최소 1장, 최대 5000장까지 가능합니다.",
      },
    },
    bookmarkCount: {
      type: Number,
      default: 0,
      min: 0,
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

// 4. 정적(Static) 메서드 구현

// 플래시카드 생성
FlashcardSchema.statics.add = async function (
  title: string,
  author: Types.ObjectId | string,
  cards: { front: string; back: string }[]
): Promise<IFlashcard> {
  const flashcard = new this({
    title,
    author: new Types.ObjectId(author),
    cards,
    bookmarkCount: 0,
  });
  await flashcard.save();
  return flashcard;
};

// 작성자가 만든 플래시카드 목록
FlashcardSchema.statics.findByAuthor = async function (
  author: string
): Promise<IFlashcard[]> {
  return await this.find({ author: new Types.ObjectId(author) }).sort({
    createdAt: -1,
  });
};

// 통계가 포함된 최근 플래시카드 목록
FlashcardSchema.statics.findRecentWithAuthor = async function (
  userId?: string
) {
  const query = this.find()
    .populate("author")
    .sort({ bookmarkCount: -1, createdAt: -1 });

  if (userId) {
    query.populate({
      path: "bookmarks",
      match: { user: new Types.ObjectId(userId) },
      select: "_id",
    });
  }

  const results = await query;

  // userId가 있을 때만 isBookmarked 추가
  if (userId) {
    return results.map((flashcard) => {
      const obj = flashcard.toObject();
      return {
        ...obj,
        isBookmarked: obj.bookmarks && obj.bookmarks.length > 0,
      };
    });
  }

  return results;
};

// 제목과 카드 내용으로 검색
FlashcardSchema.statics.searchByTitleWithAuthor = async function (
  query: string,
  userId?: string
) {
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const searchQuery = this.find({
    $or: [
      { title: { $regex: escapedQuery, $options: "i" } },
      { "cards.front": { $regex: escapedQuery, $options: "i" } },
      { "cards.back": { $regex: escapedQuery, $options: "i" } },
    ],
  })
    .populate("author")
    .sort({ bookmarkCount: -1, createdAt: -1 });

  if (userId) {
    searchQuery.populate({
      path: "bookmarks",
      match: { user: new Types.ObjectId(userId) },
      select: "_id",
    });
  }

  const results = await searchQuery;

  // userId가 있을 때만 isBookmarked 추가
  if (userId) {
    return results.map((flashcard) => {
      const obj = flashcard.toObject();
      return {
        ...obj,
        isBookmarked: obj.bookmarks && obj.bookmarks.length > 0,
      };
    });
  }

  return results;
};

// 플래시카드 삭제 (작성자 확인 포함)
FlashcardSchema.statics.deleteByIdAndAuthor = async function (
  id: string,
  author: string
): Promise<boolean> {
  const result = await this.deleteOne({
    _id: new Types.ObjectId(id),
    author: new Types.ObjectId(author),
  });
  return result.deletedCount > 0;
};

// ID 배열로 플래시카드 목록 찾기
FlashcardSchema.statics.findByIds = async function (
  ids: (string | Types.ObjectId)[]
): Promise<IFlashcard[]> {
  if (ids.length === 0) return [];
  return await this.find({
    _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
  });
};

// 작성자 정보 포함하여 플래시카드 조회
FlashcardSchema.statics.getWithAuthor = async function (
  id: string | Types.ObjectId
): Promise<(IFlashcard & { author: IUser | null }) | null> {
  const flashcard = await this.findById(id).populate("author");
  if (!flashcard) return null;
  return flashcard as IFlashcard & { author: IUser | null };
};

// 사용자의 모든 플래시카드 작성자를 null로 변경
FlashcardSchema.statics.nullifyAuthor = async function (
  author: string
): Promise<number> {
  const result = await this.updateMany(
    { author: new Types.ObjectId(author) },
    { $set: { author: null } }
  );
  return result.modifiedCount;
};

// Virtual for bookmarks
FlashcardSchema.virtual("bookmarks", {
  ref: "Bookmark",
  localField: "_id",
  foreignField: "flashcard",
});

export default FlashcardSchema;
