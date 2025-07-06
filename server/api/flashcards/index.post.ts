import { flashcardSchema } from "~/shared/schemas";
import Flashcard from "~/server/models/flashcard";
import RateLimit from "~/server/models/rateLimit";
import User from "~/server/models/user";

export default defineEventHandler(async (event) => {
  // 로그인 확인
  const { user } = await getUserSession(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "로그인이 필요합니다.",
    });
  }

  // 입력값 검증
  let validatedData;
  try {
    const body = await readBody(event);
    validatedData = flashcardSchema.parse(body);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "errors" in error &&
      Array.isArray(error.errors)
    ) {
      throw createError({
        statusCode: 400,
        message: error.errors[0].message,
      });
    }
    throw createError({
      statusCode: 400,
      message: "잘못된 요청입니다.",
    });
  }

  const { title, cards } = validatedData;

  const exitingUser = await User.checkExists(user.id);
  if (!exitingUser) {
    throw createError({
      statusCode: 403,
      message: "사용자를 찾을 수 없습니다. 다시 로그인해주세요.",
    });
  }

  // 클라이언트 IP 주소 확인
  const clientIP = getRequestIP(event, {
    xForwardedFor: true,
  });
  if (!clientIP) {
    throw createError({
      statusCode: 400,
      message: "잘못된 요청입니다.",
    });
  }
  // 잦은 요청 방지
  if (await RateLimit.checkRateLimit("create_flashcard", clientIP)) {
    throw createError({
      statusCode: 429,
      message: "너무 잦은 요청입니다. 잠시 후 다시 시도해주세요.",
    });
  }

  // 플래시카드 생성
  let flashcard;
  try {
    flashcard = await Flashcard.add(title, user.id, cards);
  } catch {
    throw createError({
      statusCode: 500,
      message: "플래시카드 생성 중 오류가 발생했습니다.",
    });
  }

  // 레이트 리밋 설정
  await RateLimit.setRateLimit("create_flashcard", clientIP, 20);

  return {
    success: true,
    message: "플래시카드가 생성되었습니다.",
    flashcard: { _id: flashcard._id },
  };
});