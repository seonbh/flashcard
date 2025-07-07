import { z } from "zod";
import { NoUserError, WrongPassword } from "~/server/models/user";
import { User } from "~/server/models";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요."),
  newPassword: z.string().min(6, "새 비밀번호는 최소 6자 이상이어야 합니다."),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: "로그인이 필요합니다.",
    });
  }

  const validation = changePasswordSchema.safeParse(await readBody(event));

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message,
    });
  }

  const { currentPassword, newPassword } = validation.data;

  // 비밀번호 변경
  try {
    await User.changePassword(session.user.id, currentPassword, newPassword);
  } catch (error) {
    if (error instanceof NoUserError) {
      throw createError({
        statusCode: 404,
        message: "사용자를 찾을 수 없습니다.",
      });
    }
    if (error instanceof WrongPassword) {
      throw createError({
        statusCode: 403,
        message: "현재 비밀번호가 올바르지 않습니다.",
      });
    }
    // 기타 서버 오류
    console.error("비밀번호 변경 실패:", error);
    throw createError({
      statusCode: 500,
      message: "비밀번호 변경에 실패했습니다.",
    });
  }

  return {
    success: true,
    message: "비밀번호가 성공적으로 변경되었습니다.",
  };
});
