<template>
  <div
    class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-sm w-full space-y-8">
      <div>
        <h2 class="text-center text-xl font-extrabold">회원가입</h2>
      </div>

      <UForm
        :schema="signupSchema"
        :state="formState"
        class="mt-8 space-y-6"
        @submit="onSubmit"
      >
        <div class="space-y-4">
          <UFormField label="아이디 & 닉네임" name="id" required>
            <UInput
              v-model="formState.name"
              placeholder="영문, 숫자, 한글 2-10자"
              class="w-full"
              :disabled="pending"
              minlength="2"
              maxlength="10"
            />
          </UFormField>

          <UFormField label="비밀번호" name="password" required>
            <UInput
              v-model="formState.password"
              type="password"
              placeholder="최소 6자 이상"
              class="w-full"
              :disabled="pending"
              minlength="6"
              maxlength="100"
            />
          </UFormField>
          <UFormField label="비밀번호 확인" name="confirmPassword" required>
            <UInput
              v-model="formState.confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              class="w-full"
              :disabled="pending"
              minlength="6"
              maxlength="100"
            />
          </UFormField>
        </div>

        <!-- 약관 동의 -->
        <div class="space-y-3">
          <UFormField name="termsAgreed" required>
            <UCheckbox v-model="formState.termsAgreed" :disabled="pending">
              <template #label>
                <span class="text-sm">
                  <NuxtLink
                    to="/terms"
                    target="_blank"
                    class="text-primary hover:text-primary/80 underline"
                  >
                    이용약관 </NuxtLink
                  >에 동의합니다
                </span>
              </template>
            </UCheckbox>
          </UFormField>

          <UFormField name="privacyAgreed" required>
            <UCheckbox v-model="formState.privacyAgreed" :disabled="pending">
              <template #label>
                <span class="text-sm">
                  <NuxtLink
                    to="/privacy"
                    target="_blank"
                    class="text-primary hover:text-primary/80 underline"
                  >
                    개인정보처리방침 </NuxtLink
                  >에 동의합니다
                </span>
              </template>
            </UCheckbox>
          </UFormField>
        </div>

        <div>
          <UButton
            type="submit"
            class="w-full"
            :loading="pending"
            :disabled="pending"
            block
          >
            회원가입
          </UButton>
        </div>
      </UForm>

      <div class="text-center">
        <NuxtLink
          to="/auth/login"
          class="text-sm text-primary hover:text-primary/80"
        >
          이미 계정이 있으신가요? 로그인하기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";

definePageMeta({
  layout: false,
});

useSeoMeta({
  title: "회원가입 | 플래시카드",
  description: "회원가입",
  robots: "noindex, nofollow",
});

const signupSchema = z.object({
  name: z
    .string()
    .min(2, "이름은 최소 2자 이상이어야 합니다.")
    .max(10, "이름은 최대 10자까지 가능합니다.")
    .regex(/^[a-zA-Z0-9가-힣]+$/, "이름은 영문, 숫자, 한글만 사용 가능합니다."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
  confirmPassword: z
    .string()
    .min(6, "비밀번호 확인은 최소 6자 이상이어야 합니다.")
    .refine((val) => val === formState.password, {
      message: "비밀번호와 일치하지 않습니다.",
    }),
  termsAgreed: z
    .boolean()
    .refine((val) => val === true, "이용약관에 동의해주세요."),
  privacyAgreed: z
    .boolean()
    .refine((val) => val === true, "개인정보처리방침에 동의해주세요."),
});

const formState = reactive({
  name: "",
  password: "",
  confirmPassword: "",
  termsAgreed: false,
  privacyAgreed: false,
});

const pending = ref(false);

const toast = useToast();
const { fetch: fetchUserSession } = useUserSession();

async function onSubmit() {
  try {
    pending.value = true;

    await $fetch("/api/auth/signup", {
      method: "POST",
      body: formState,
    });

    // 세션 갱신
    await fetchUserSession();

    toast.add({
      title: "회원가입 성공",
      description: "회원가입이 완료되었습니다. 자동으로 로그인됩니다.",
      duration: 3000,
    });

    await navigateTo("/", { replace: true });
  } catch (err) {
    let errorMessage = "회원가입 중 오류가 발생했습니다.";

    if (err && typeof err === "object") {
      if (
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data
      ) {
        errorMessage = err.data.message as string;
      } else if ("message" in err && typeof err.message === "string") {
        errorMessage = err.message;
      } else {
        errorMessage = "알 수 없는 오류가 발생했습니다.";
      }
    }

    toast.add({
      title: "회원가입 실패",
      color: "error",
      description: errorMessage,
      duration: 5000,
    });
  } finally {
    pending.value = false;
  }
}
</script>
