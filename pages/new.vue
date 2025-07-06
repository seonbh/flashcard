<template>
  <div class="max-w-4xl mx-auto py-8">
    <UForm
      :schema="createFlashcardSchema"
      :state="formState"
      class="space-y-8"
      :validate-on="[]"
      @submit="onSubmit"
    >
      <!-- 기본 정보 -->
      <div class="space-y-4 px-4">
        <UFormField label="플래시카드 제목" name="title" required>
          <UInput
            v-model="formState.title"
            placeholder="플래시카드 제목을 입력하세요"
            :disabled="pending"
            class="w-full"
            maxlength="20"
          />
        </UFormField>
      </div>

      <!-- 카드 목록 -->
      <UFormField label="카드 목록" name="cards" required class="px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard v-for="(card, index) in formState.cards" :key="index">
            <div class="space-y-3">
              <UInput
                v-model="card.front"
                class="w-full"
                placeholder="카드 앞면 내용"
                :disabled="pending"
                maxlength="50"
              />
              <UTextarea
                v-model="card.back"
                class="w-full"
                placeholder="카드 뒷면 내용"
                :disabled="pending"
                :rows="2"
                autoresize
                maxlength="100"
              />
              <UButton
                block
                color="neutral"
                label="삭제"
                variant="outline"
                :disabled="pending || formState.cards.length <= 1"
                @click="removeCard(index)"
              />
            </div>
          </UCard>
          <UCard class="flex items-center justify-center">
            <UButton
              block
              variant="soft"
              color="primary"
              label="카드 추가"
              :disabled="pending"
              @click="addCard"
            />
          </UCard>
        </div>
      </UFormField>

      <!-- 제출 버튼 -->
      <div class="flex justify-end space-x-4 px-4">
        <UButton variant="ghost" to="/" :disabled="pending">취소</UButton>
        <UButton type="submit" :loading="pending" :disabled="pending">
          플래시카드 만들기
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { createFlashcardSchema } from "~/shared/schemas";

definePageMeta({
  middleware: "auth",
});

useSeoMeta({
  title: "새 플래시카드 만들기 | 플래시카드",
  description: "플래시카드 만들기",
  robots: "noindex, nofollow",
});

const formState = reactive({
  title: "",
  cards: [{ front: "", back: "" }],
});

const pending = ref(false);

const toast = useToast();

function addCard() {
  formState.cards.push({
    front: "",
    back: "",
  });
}

function removeCard(index: number) {
  formState.cards.splice(index, 1);
}

async function onSubmit() {
  try {
    pending.value = true;

    const res = await $fetch("/api/flashcards", {
      method: "POST",
      body: formState,
    });

    toast.add({
      title: "플래시카드 생성 완료",
      description: "플래시카드가 성공적으로 생성되었습니다.",
      color: "success",
      duration: 3000,
    });

    await navigateTo(`/${res.flashcard._id}`, { replace: true });
  } catch (err) {
    const error = err as { data?: { message?: string }; message?: string };
    const errorMessage =
      error?.data?.message ??
      error?.message ??
      "플래시카드 생성 중 오류가 발생했습니다.";

    toast.add({
      title: "플래시카드 생성 실패",
      description: errorMessage,
      color: "error",
      duration: 5000,
    });
  } finally {
    pending.value = false;
  }
}
</script>
