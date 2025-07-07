import { z } from "zod";
import { User, RateLimit } from "~/server/models";

const loginSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export default defineEventHandler(async (event) => {
  const parsed = loginSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.errors[0].message,
    });
  }

  const { name, password } = parsed.data;

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
  if (await RateLimit.checkRateLimit("login", clientIP)) {
    throw createError({
      statusCode: 429,
      message: "너무 잦은 요청입니다. 잠시 후 다시 시도해주세요.",
    });
  }
  // 레이트 리밋 설정: 이 경우만 시도부터 방지
  await RateLimit.setRateLimit("login", clientIP, 5);

  const user = await User.findByNameAndPassword(name, password);
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "이름 또는 비밀번호가 잘못되었습니다.",
    });
  }

  // 밴 상태 확인
  if (user.isBanned) {
    throw createError({
      statusCode: 403,
      message: `계정이 차단되었습니다. 사유: ${user.banReason ?? "알 수 없음"}`,
    });
  }

  // 세션 생성
  await setUserSession(event, {
    user: {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
    },
  });

  return {
    success: true,
    message: "로그인되었습니다.",
    user: {
      id: user._id.toString(),
      role: user.role,
    },
  };
});
