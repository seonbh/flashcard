import Flashcard from "~/server/models/flashcard";
import type { IUser } from "~/server/models/user";

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  const query = getQuery(event);
  const search = query.search as string;

  let flashcards;
  try {
    if (search && search.trim()) {
      flashcards = await Flashcard.searchByTitleWithAuthor(
        search.trim(),
        user?.id
      );
    } else {
      flashcards = await Flashcard.findRecentWithAuthor(user?.id);
    }
  } catch (err) {
    console.error("Error fetching flashcards:", err);
    throw createError({
      statusCode: 500,
      message: "플래시카드 조회 중 오류가 발생했습니다.",
    });
  }

  return {
    success: true,
    flashcards: flashcards.map((flashcard) => ({
      _id: flashcard._id,
      title: flashcard.title,
      firstCardFront: flashcard.cards[0].front,
      cardCount: flashcard.cards?.length ?? 0,
      author: flashcard.author
        ? {
            name: (flashcard.author as IUser).name,
          }
        : null,
      bookmarkCount: flashcard.bookmarkCount,
      createdAt: flashcard.createdAt,
      isBookmarked: flashcard.isBookmarked || false,
    })),
  };
});
