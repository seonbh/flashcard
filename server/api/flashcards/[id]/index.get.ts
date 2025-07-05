import Flashcard from "~/server/models/flashcard";
import Bookmark from "~/server/models/bookmark";

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID가 필요합니다.",
    });
  }

  let flashcard;
  try {
    flashcard = await Flashcard.getWithAuthor(id);
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

  let isBookmarked = false;
  if (user) {
    try {
      isBookmarked = await Bookmark.bookmarked(user.id, id);
    } catch {
      isBookmarked = false;
    }
  }

  return {
    success: true,
    flashcard: {
      _id: flashcard._id,
      title: flashcard.title,
      cards: flashcard.cards,
      bookmarkCount: flashcard.bookmarkCount,
      createdAt: flashcard.createdAt,
      author: flashcard.author
        ? {
            id: flashcard.author._id,
            name: flashcard.author.name,
          }
        : null,
    },
    isBookmarked,
  };
});
