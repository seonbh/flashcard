import type { IFlashcard } from "~/server/models/flashcard";
import type { IBookmark } from "~/server/models/bookmark";
import { Flashcard, Bookmark } from "~/server/models";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: "로그인이 필요합니다.",
    });
  }

  let createdFlashcards: IFlashcard[] = [];
  let bookmarkedFlashcards: IBookmark[] = [];

  try {
    // 내가 만든 플래시카드 목록
    createdFlashcards = await Flashcard.findByAuthor(session.user.id);
  } catch (error) {
    console.error("Error fetching created flashcards:", error);
    createdFlashcards = [];
  }

  try {
    // 내가 북마크한 플래시카드들
    const bookmarks = await Bookmark.findByUser(session.user.id);
    bookmarkedFlashcards = bookmarks.filter((bookmark) => bookmark.flashcard);
  } catch (error) {
    console.error("Error fetching bookmarked flashcards:", error);
    bookmarkedFlashcards = [];
  }

  return {
    createdFlashcards: createdFlashcards.map((flashcard) => ({
      _id: flashcard._id,
      title: flashcard.title,
      createdAt: flashcard.createdAt,
      cardCount: flashcard.cards.length,
    })),
    bookmarkedFlashcards: bookmarkedFlashcards.map((bookmark) => {
      const flashcard = bookmark.flashcard as IFlashcard;
      return {
        _id: flashcard._id,
        title: flashcard.title,
        createdAt: bookmark.createdAt,
        cardCount: flashcard.cards.length,
      };
    }),
  };
});
