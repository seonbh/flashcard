<template>
  <div
    class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-sm w-full space-y-8">
      <div>
        <h2 class="text-center text-xl font-extrabold">로그인</h2>
      </div>

      <UForm
        :schema="loginSchema"
        :state="formState"
        class="mt-8 space-y-6"
        @submit="onSubmit"
      >
        <div class="space-y-4">
          <UFormField label="아이디 & 닉네임" name="id" required>
            <UInput
              v-model="formState.name"
              class="w-full"
              placeholder="아이디를 입력하세요."
              :disabled="pending"
              minlength="2"
              maxlength="10"
            />
          </UFormField>

          <UFormField label="비밀번호" name="password" required>
            <UInput
              v-model="formState.password"
              class="w-full"
              type="password"
              placeholder="비밀번호를 입력하세요."
              :disabled="pending"
              minlength="6"
              maxlength="100"
            />
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
            로그인
          </UButton>
        </div>
      </UForm>

      <div class="text-center">
        <NuxtLink
          to="/auth/signup"
          class="text-sm text-primary hover:text-primary/80"
        >
          계정이 없으신가요? 회원가입하기
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
  title: "로그인 | 플래시카드",
  description: "로그인",
  robots: "noindex, nofollow",
});

const loginSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "이름은 최소 2자 이상이어야 합니다.")
    .max(10, "이름은 최대 10자까지 가능합니다.")
    .regex(/^[a-zA-Z0-9가-힣]+$/, "이름은 영문, 숫자, 한글만 사용 가능합니다."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
});

const formState = reactive({
  name: "",
  password: "",
});

const pending = ref(false);

const toast = useToast();
const { fetch: fetchUserSession } = useUserSession();

async function onSubmit() {
  try {
    pending.value = true;

    await $fetch("/api/auth/login", {
      method: "POST",
      body: formState,
    });

    // 세션 갱신
    await fetchUserSession();

    toast.add({
      title: "로그인 성공",
      description: "로그인되었습니다.",
      duration: 3000,
    });

    await navigateTo("/", { replace: true });
  } catch (err) {
    let errorMessage = "로그인 중 오류가 발생했습니다.";

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
      }
    }

    toast.add({
      title: "로그인 실패",
      description: errorMessage,
      color: "error",
      duration: 5000,
    });
  } finally {
    pending.value = false;
  }
}
</script>
