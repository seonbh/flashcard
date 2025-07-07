import type { IFlashcard } from "~/server/models/flashcard";
import { Bookmark, Flashcard, User } from "~/server/models";
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
  // 로그인 확인
  const { user } = await getUserSession(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "로그인이 필요합니다.",
    });
  }

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID가 필요합니다.",
    });
  }

  let exitingUser;
  try {
    exitingUser = await User.checkExists(user.id);
  } catch {
    throw createError({
      statusCode: 500,
      message: "사용자 확인 중 오류가 발생했습니다.",
    });
  }

  if (!exitingUser) {
    throw createError({
      statusCode: 403,
      message: "사용자를 찾을 수 없습니다. 다시 로그인해주세요.",
    });
  }

  let flashcard;
  try {
    flashcard = await Flashcard.findById(id);
  } catch {
    throw createError({
      statusCode: 500,
      message: "플래시카드 조회 중 오류가 발생했습니다.",
    });
  }

  if (!flashcard) {
    throw createError({
      statusCode: 404,
      message: "플래시카드를 찾을 수 없습니다.",
    });
  }

  const session = await mongoose.startSession();
  let isBookmarked = false;
  let updatedFlashcard: IFlashcard | null;
  try {
    await session.withTransaction(async () => {
      const bookmarked = await Bookmark.bookmarked(user.id, id);

      if (bookmarked) {
        // 북마크 해제
        await Bookmark.remove(user.id, id);
        updatedFlashcard = await Flashcard.findByIdAndUpdate(
          id,
          { $inc: { bookmarkCount: -1 } },
          { new: true }
        );
        isBookmarked = false;
      } else {
        // 북마크 추가
        await Bookmark.add(user.id, id);
        updatedFlashcard = await Flashcard.findByIdAndUpdate(
          id,
          { $inc: { bookmarkCount: 1 } },
          { new: true }
        );
        isBookmarked = true;
      }
    });

    if (!updatedFlashcard!) {
      throw new Error();
    }
  } catch {
    session.abortTransaction();
    throw createError({
      statusCode: 500,
      message: "북마크 처리 중 오류가 발생했습니다.",
    });
  } finally {
    await session.endSession();
  }
  return {
    success: true,
    isBookmarked,
    bookmarkCount:
      (updatedFlashcard as unknown as IFlashcard)?.bookmarkCount ?? 0,
  };
});
