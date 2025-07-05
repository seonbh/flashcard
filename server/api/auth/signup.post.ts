import { z } from "zod";
import User, { NameDuplicateError } from "~/server/models/user";
import RateLimit from "~/server/models/rateLimit";

// 금지된 아이디 목록
const FORBIDDEN_IDS = [
  "admin",
  "관리자",
  "관리인",
  "운영진",
  "운영자",
  "주인장",
  "staff",
  "master",
  "owner",
  "root",
  "superuser",
  "guest",
  "test",
  "anonymous",
];

const signupSchema = z.object({
  name: z
    .string()
    .min(2, "이름은 최소 2자 이상이어야 합니다.")
    .max(10, "이름은 최대 10자까지 가능합니다.")
    .regex(/^[a-zA-Z0-9가-힣]+$/, "이름은 영문, 숫자, 한글만 사용 가능합니다.")
    .refine(
      (id) => !FORBIDDEN_IDS.includes(id.toLowerCase()),
      "사용할 수 없는 이름입니다."
    ),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
  termsAgreed: z
    .boolean()
    .refine((val) => val === true, "이용약관에 동의해주세요."),
  privacyAgreed: z
    .boolean()
    .refine((val) => val === true, "개인정보처리방침에 동의해주세요."),
});

export default defineEventHandler(async (event) => {
  // 입력값 검증
  const validatedBody = signupSchema.safeParse(await readBody(event));

  if (!validatedBody.success) {
    throw createError({
      statusCode: 400,
      message: validatedBody.error.errors[0].message,
    });
  }

  const { name, password } = validatedBody.data;

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
  if (await RateLimit.checkRateLimit("signup", clientIP)) {
    throw createError({
      statusCode: 429,
      message: "너무 잦은 요청입니다. 잠시 후 다시 시도해주세요.",
    });
  }

  let user;
  try {
    user = await User.register(name, password);
  } catch (error) {
    if (error instanceof NameDuplicateError) {
      throw createError({
        statusCode: 409,
        message: "이미 사용 중인 이름입니다. 다른 이름을 선택해주세요.",
      });
    }
    throw createError({
      statusCode: 500,
      message: "서버 오류가 발생했습니다.",
    });
  }

  // 자동 로그인 처리
  await setUserSession(event, {
    user: { id: user._id.toString(), name: user.name, role: user.role },
  });

  await RateLimit.setRateLimit("signup", clientIP, 30);

  return {
    success: true,
    message: "회원가입이 완료되었습니다.",
    user: { id: user.id, role: user.role },
  };
});
