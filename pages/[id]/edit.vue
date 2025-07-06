<template>
  <div class="max-w-4xl mx-auto py-8">
    <div v-if="pending" class="text-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-1 border-primary/30 dark:border-primary/50 mx-auto"
      />
    </div>

    <div v-else-if="error" class="text-center py-12">
      <h1 class="text-lg font-bold mb-4">오류가 발생했습니다</h1>
      <p class="text-sm opacity-70 mb-4">
        {{ error.message ?? "알 수 없는 오류입니다." }}
      </p>
      <UButton to="/">홈으로 돌아가기</UButton>
    </div>

    <div v-else-if="!flashcard" class="text-center py-12">
      <h1 class="text-lg font-bold mb-4">플래시카드를 찾을 수 없습니다</h1>
      <UButton to="/">홈으로 돌아가기</UButton>
    </div>

    <div v-else>
      <UForm
        :schema="flashcardSchema"
        :state="formState"
        class="space-y-8"
        :validate-on="[]"
        @submit="onSubmit"
      >
        <FlashcardTitle v-model="formState.title" :disabled="submitting" />

        <!-- 카드 목록 -->
        <UFormField label="카드 목록" name="cards" required class="px-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FlashcardCard
              v-for="(card, index) in formState.cards"
              :key="index"
              v-model="formState.cards[index]"
              :disabled="submitting"
              :can-delete="formState.cards.length > 1"
              @remove="removeCard(index)"
            />
            <UCard class="flex items-center justify-center">
              <UButton
                block
                variant="soft"
                color="primary"
                label="카드 추가"
                :disabled="submitting"
                @click="addCard"
              />
            </UCard>
          </div>
        </UFormField>

        <!-- 제출 버튼 -->
        <div class="flex justify-end space-x-4 px-4">
          <UButton
            variant="ghost"
            :to="`/${flashcardId}`"
            :disabled="submitting"
            >취소</UButton
          >
          <UButton type="submit" :loading="submitting" :disabled="submitting">
            플래시카드 수정
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { flashcardSchema } from "~/shared/schemas";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const flashcardId = route.params.id as string;

const { data, pending, error } = await useFetch(
  `/api/flashcards/${flashcardId}` as "/api/flashcards/[id]",
  { key: `flashcard-edit-${flashcardId}` }
);

const { user } = useUserSession();
const flashcard = computed(() => data.value?.flashcard);

useSeoMeta({
  title: computed(() =>
    flashcard.value
      ? `${flashcard.value.title} 수정 | 플래시카드`
      : "플래시카드 수정"
  ),
  description: "플래시카드 수정",
  robots: "noindex, nofollow",
});

// 권한 확인
const canEdit = computed(() => {
  return (
    user.value &&
    flashcard.value &&
    user.value.id === flashcard.value.author?.id
  );
});

// 권한이 없으면 404로 리다이렉트
watchEffect(() => {
  if (!pending.value && flashcard.value && !canEdit.value) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found",
    });
  }
});

const formState = reactive({
  title: "",
  cards: [{ front: "", back: "" }],
});

// 플래시카드 데이터로 폼 초기화
watchEffect(() => {
  if (flashcard.value) {
    formState.title = flashcard.value.title;
    formState.cards = [...flashcard.value.cards];
  }
});

const submitting = ref(false);
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
    submitting.value = true;

    await $fetch(`/api/flashcards/${flashcardId}`, {
      method: "PUT",
      body: formState,
    });

    toast.add({
      title: "플래시카드 수정 완료",
      description: "플래시카드가 성공적으로 수정되었습니다.",
      color: "success",
      duration: 3000,
    });

    await navigateTo(`/${flashcardId}`, { replace: true });
  } catch (err) {
    const error = err as { data?: { message?: string }; message?: string };
    const errorMessage =
      error?.data?.message ??
      error?.message ??
      "플래시카드 수정 중 오류가 발생했습니다.";

    toast.add({
      title: "플래시카드 수정 실패",
      description: errorMessage,
      color: "error",
      duration: 5000,
    });
  } finally {
    submitting.value = false;
  }
}
</script>
