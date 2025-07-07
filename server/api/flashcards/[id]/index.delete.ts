import { Flashcard, Bookmark, User } from "~/server/models";

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

  let deleted;
  try {
    deleted = await Flashcard.deleteByIdAndAuthor(id, user.id);
    if (deleted) {
      // 관련된 북마크들도 삭제
      await Bookmark.removeByFlashcard(id);
    }
  } catch {
    throw createError({
      statusCode: 500,
      message: "플래시카드 삭제 중 오류가 발생했습니다.",
    });
  }

  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: "플래시카드를 찾을 수 없거나 삭제 권한이 없습니다.",
    });
  }

  return {
    success: true,
    message: "플래시카드가 삭제되었습니다.",
  };
});
