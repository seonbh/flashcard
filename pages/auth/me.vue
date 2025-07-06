<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold">내 정보</h1>
      <div class="flex gap-2">
        <UButton
          color="error"
          variant="outline"
          @click="showPasswordModal = true"
        >
          비밀번호 변경
        </UButton>
        <UButton
          color="error"
          variant="outline"
          @click="showWithdrawalModal = true"
        >
          탈퇴
        </UButton>
      </div>
    </div>

    <!-- 내가 만든 플래시카드 -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">내가 만든 플래시카드</h2>
      <div v-if="data?.createdFlashcards?.length" class="grid gap-4">
        <div
          v-for="flashcard in data.createdFlashcards"
          :key="flashcard._id"
          class="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <NuxtLink
                :to="`/${flashcard._id}`"
                class="text-lg font-medium hover:text-primary-500"
              >
                {{ flashcard.title }}
              </NuxtLink>
              <div
                class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2"
              >
                <span>{{ flashcard.cardCount }}장</span>
                <span>{{ formatDate(flashcard.createdAt) }}</span>
              </div>
            </div>
            <UButton
              color="error"
              variant="ghost"
              size="sm"
              icon="i-heroicons-trash"
              @click="deleteFlashcard(flashcard._id)"
            />
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        아직 만든 플래시카드가 없습니다.
      </div>
    </div>

    <!-- 내가 북마크한 플래시카드 -->
    <div>
      <h2 class="text-xl font-semibold mb-4">내가 북마크한 플래시카드</h2>
      <div v-if="data?.bookmarkedFlashcards?.length" class="grid gap-4">
        <div
          v-for="flashcard in data.bookmarkedFlashcards"
          :key="flashcard._id"
          class="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <NuxtLink
                :to="`/${flashcard._id}`"
                class="text-lg font-medium hover:text-primary-500"
              >
                {{ flashcard.title }}
              </NuxtLink>
              <div
                class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2"
              >
                <span>{{ flashcard.cardCount }}장</span>
                <span>{{ formatDate(flashcard.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        아직 북마크한 플래시카드가 없습니다.
      </div>
    </div>

    <!-- 비밀번호 변경 모달 -->
    <UModal v-model="showPasswordModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">비밀번호 변경</h3>
        </template>
        <UForm @submit="changePassword" class="space-y-4">
          <UFormGroup label="새 비밀번호">
            <UInput
              v-model="newPassword"
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              required
            />
          </UFormGroup>
          <UFormGroup label="비밀번호 확인">
            <UInput
              v-model="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              variant="outline"
              @click="showPasswordModal = false"
            >
              취소
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :loading="isChangingPassword"
            >
              변경
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- 탈퇴 모달 -->
    <UModal v-model="showWithdrawalModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-600">회원 탈퇴</h3>
        </template>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-400">
            정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="showWithdrawalModal = false">
              취소
            </UButton>
            <UButton color="error" @click="withdraw" :loading="isWithdrawing">
              탈퇴
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

definePageMeta({
  middleware: "auth",
});

const { data, refresh } = await $fetch("/api/me");

const showPasswordModal = ref(false);
const showWithdrawalModal = ref(false);
const newPassword = ref("");
const confirmPassword = ref("");
const isChangingPassword = ref(false);
const isWithdrawing = ref(false);

function formatDate(date) {
  return dayjs(date).format("YYYY.MM.DD");
}

async function changePassword() {
  if (newPassword.value !== confirmPassword.value) {
    return;
  }

  isChangingPassword.value = true;
  try {
    await $fetch("/api/me/password", {
      method: "PATCH",
      body: { password: newPassword.value },
    });
    showPasswordModal.value = false;
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (error) {
    console.error("Password change failed:", error);
  } finally {
    isChangingPassword.value = false;
  }
}

async function withdraw() {
  isWithdrawing.value = true;
  try {
    await $fetch("/api/me/withdrawal", {
      method: "DELETE",
    });
    await navigateTo("/auth/login");
  } catch (error) {
    console.error("Withdrawal failed:", error);
  } finally {
    isWithdrawing.value = false;
  }
}

async function deleteFlashcard(id) {
  if (!confirm("정말로 이 플래시카드를 삭제하시겠습니까?")) {
    return;
  }

  try {
    await $fetch(`/api/flashcards/${id}`, {
      method: "DELETE",
    });
    await refresh();
  } catch (error) {
    console.error("Delete failed:", error);
  }
}
</script>
