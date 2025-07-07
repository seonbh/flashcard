import { Flashcard, User } from "~/server/models";
import { flashcardSchema } from "~/shared/schemas";

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

  let body;
  try {
    body = await readBody(event);
  } catch {
    throw createError({
      statusCode: 400,
      message: "잘못된 요청 데이터입니다.",
    });
  }

  // 스키마 검증
  const validatedData = flashcardSchema.parse(body);

  let existingUser;
  try {
    existingUser = await User.checkExists(user.id);
  } catch {
    throw createError({
      statusCode: 500,
      message: "사용자 확인 중 오류가 발생했습니다.",
    });
  }

  if (!existingUser) {
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

  // 작성자 확인
  if (flashcard.author?.toString() !== user.id) {
    throw createError({
      statusCode: 403,
      message: "수정 권한이 없습니다.",
    });
  }

  let updatedFlashcard;
  try {
    updatedFlashcard = await Flashcard.findByIdAndUpdate(
      id,
      {
        title: validatedData.title,
        cards: validatedData.cards,
      },
      { new: true }
    ).populate("author");
  } catch {
    throw createError({
      statusCode: 500,
      message: "플래시카드 수정 중 오류가 발생했습니다.",
    });
  }

  return {
    success: true,
    message: "플래시카드가 성공적으로 수정되었습니다.",
    flashcard: updatedFlashcard,
  };
});
