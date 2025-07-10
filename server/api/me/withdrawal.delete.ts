import mongoose from "mongoose";
import { Flashcard, Bookmark, User } from "~/server/models";

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "로그인이 필요합니다.",
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const deleted = await User.withdrawal(user.id, { session });
    if (!deleted) {
      throw new Error("계정 삭제에 실패했습니다.");
    }
    await Flashcard.nullifyAuthor(user.id, { session });
    await Bookmark.nullifyUser(user.id, { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error("탈퇴 처리 중 오류:", error);
    throw createError({
      statusCode: 500,
      message: "탈퇴 처리 중 오류가 발생했습니다.",
    });
  } finally {
    await session.endSession();
  }

  await clearUserSession(event);

  return {
    success: true,
    message: "계정이 성공적으로 삭제되었습니다.",
  };
});
