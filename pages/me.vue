<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div v-if="pending" class="text-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-1 border-primary/30 dark:border-primary/50 mx-auto"
      />
    </div>

    <div v-else-if="error" class="text-center py-12">
      <h1 class="text-lg font-bold mb-4">오류가 발생했습니다</h1>
      <UButton to="/">홈으로 돌아가기</UButton>
    </div>

    <div v-else>
      <!-- 비밀번호 변경 -->
      <div class="mb-12">
        <h2 class="text-lg font-semibold mb-4">비밀번호 변경</h2>
        <UForm
          :schema="passwordSchema"
          :state="passwordState"
          class="max-w-md space-y-4"
          @submit="changePassword"
        >
          <UFormField label="현재 비밀번호" name="currentPassword" required>
            <UInput
              v-model="passwordState.currentPassword"
              type="password"
              :disabled="changingPassword"
              maxlength="100"
            />
          </UFormField>

          <UFormField label="새 비밀번호" name="newPassword" required>
            <UInput
              v-model="passwordState.newPassword"
              type="password"
              :disabled="changingPassword"
              minlength="6"
              maxlength="100"
            />
          </UFormField>

          <UButton
            type="submit"
            :loading="changingPassword"
            :disabled="changingPassword"
            variant="soft"
          >
            비밀번호 변경
          </UButton>
        </UForm>
      </div>

      <!-- 내가 만든 플래시카드 -->
      <div class="mb-12">
        <h2 class="text-lg font-semibold mb-4">
          내가 만든 플래시카드 ({{ createdFlashcards.length }}개)
        </h2>

        <div
          v-if="createdFlashcards.length === 0"
          class="text-center py-8 text-gray-500"
        >
          아직 만든 플래시카드가 없습니다.
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <NuxtLink
            v-for="flashcard in createdFlashcards"
            :key="flashcard._id"
            class="border-1 border-gray-300/70 dark:border-gray-700/70 rounded-lg cursor-pointer hover:border-gray-300/80 dark:hover:border-gray-700/80 p-4"
            :to="`/${flashcard._id}`"
          >
            <h3 class="font-semibold text-lg mb-2 truncate">
              {{ flashcard.title }}
            </h3>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm">{{ flashcard.cardCount }}장</span>
            </div>
            <div class="text-xs opacity-70">
              {{ toRelTime(flashcard.createdAt) }}
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- 내가 북마크한 플래시카드 -->
      <div>
        <h2 class="text-lg font-semibold mb-4">
          내가 북마크한 플래시카드 ({{ bookmarkedFlashcards.length }}개)
        </h2>

        <div
          v-if="bookmarkedFlashcards.length === 0"
          class="text-center py-8 text-gray-500"
        >
          아직 북마크한 플래시카드가 없습니다.
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <NuxtLink
            v-for="flashcard in bookmarkedFlashcards"
            :key="flashcard._id as string"
            class="border-1 border-gray-300/70 dark:border-gray-700/70 rounded-lg cursor-pointer hover:border-gray-300/80 dark:hover:border-gray-700/80 p-4"
            :to="`/${flashcard._id}`"
          >
            <h3 class="font-semibold text-lg mb-2 truncate">
              {{ flashcard.title }}
            </h3>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm">{{ flashcard.cardCount }}장</span>
            </div>
            <div class="text-xs opacity-70">
              {{ toRelTime(flashcard.createdAt) }}
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- 탈퇴 버튼 -->
      <div
        class="mt-16 pt-8 border-t-1 border-gray-300/70 dark:border-gray-700/70"
      >
        <div class="text-center">
          <UButton
            variant="ghost"
            :loading="withdrawing"
            color="neutral"
            size="sm"
            @click="withdrawUser"
          >
            회원 탈퇴
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
const { clear } = useUserSession();

definePageMeta({
  middleware: "auth",
});

useSeoMeta({
  title: "마이페이지 | 플래시카드",
  description: "내 정보 관리",
  robots: "noindex, nofollow",
});

const { data, pending, error } = await useFetch("/api/me");

const createdFlashcards = computed(() => data.value?.createdFlashcards ?? []);
const bookmarkedFlashcards = computed(() => data.value?.bookmarkedFlashcards ?? []);

const withdrawing = ref(false);
const changingPassword = ref(false);
const toast = useToast();

// 비밀번호 변경 관련
const passwordSchema = z.object({
  currentPassword: z
    .string()
    .trim()
    .min(6, "현재 비밀번호는 최소 6자 이상이어야 합니다."),
  newPassword: z
    .string()
    .trim()
    .min(6, "새 비밀번호는 최소 6자 이상이어야 합니다.")
    .refine((val) => val !== passwordState.currentPassword, {
      message: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
    }),
});

const passwordState = reactive({
  currentPassword: "",
  newPassword: "",
});

async function changePassword() {
  try {
    changingPassword.value = true;

    await $fetch("/api/me/password", {
      method: "PATCH",
      body: {
        currentPassword: passwordState.currentPassword,
        newPassword: passwordState.newPassword,
      },
    });

    toast.add({
      title: "비밀번호 변경 완료",
      description: "비밀번호가 성공적으로 변경되었습니다.",
      color: "success",
      duration: 3000,
    });

    // 폼 초기화
    passwordState.currentPassword = "";
    passwordState.newPassword = "";
  } catch (err) {
    const error = err as { data?: { message?: string }; message?: string };
    const errorMessage =
      error?.data?.message ??
      error?.message ??
      "비밀번호 변경 중 오류가 발생했습니다.";

    toast.add({
      title: "비밀번호 변경 실패",
      description: errorMessage,
      color: "error",
      duration: 5000,
    });
  } finally {
    changingPassword.value = false;
  }
}

async function withdrawUser() {
  if (
    !confirm(
      "정말로 탈퇴하시겠습니까? 작성하신 모든 콘텐츠에서 작성자 정보가 삭제되며, 복구할 수 없습니다."
    )
  ) {
    return;
  }

  try {
    withdrawing.value = true;

    await $fetch("/api/me/withdrawal", {
      method: "DELETE",
    });

    toast.add({
      title: "탈퇴 완료",
      description: "지금까지 이용해 주셔서 감사합니다.",
      color: "success",
      duration: 3000,
    });

    await clear();
    await navigateTo("/");
  } catch (err) {
    const error = err as { data?: { message?: string }; message?: string };
    const errorMessage =
      error?.data?.message ??
      error?.message ??
      "탈퇴 처리 중 오류가 발생했습니다.";

    toast.add({
      title: "탈퇴 실패",
      description: errorMessage,
      color: "error",
      duration: 5000,
    });
  } finally {
    withdrawing.value = false;
  }
}
</script>
