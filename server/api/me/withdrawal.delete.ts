import User from "~/server/models/user";
import Flashcard from "~/server/models/flashcard";
import Bookmark from "~/server/models/bookmark";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: "로그인이 필요합니다.",
    });
  }

  const userId = session.user.id;

  try {
    await Flashcard.nullifyAuthor(userId); // 사용자가 만든 모든 플래시카드
    await Bookmark.nullifyUser(userId); // 사용자의 모든 북마크
  } catch (error) {
    console.error("탈퇴 처리 중 오류:", error);
    throw createError({
      statusCode: 500,
      message: "탈퇴 처리 중 오류가 발생했습니다.",
    });
  }
  let deletedUser;
  try {
    deletedUser = await User.findByIdAndDelete(userId);
  } catch (error) {
    console.error("계정 삭제 중 오류:", error);
    throw createError({
      statusCode: 500,
      message: "계정 삭제 중 오류가 발생했습니다.",
    });
  }
  if (!deletedUser) {
    throw createError({
      statusCode: 500,
      message: "계정 삭제에 실패했습니다.",
    });
  }

  // 4. 세션 종료
  await clearUserSession(event);

  return {
    success: true,
    message: "계정이 성공적으로 삭제되었습니다.",
  };
});
