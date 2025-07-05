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
      <!-- 헤더 -->
      <div class="px-0 sm:px-4 mb-8">
        <h1 class="text-xl font-bold mb-2">{{ flashcard.title }}</h1>
        <div class="flex items-center gap-2 text-sm opacity-70">
          <span>by {{ flashcard.author?.name ?? "알 수 없는 사용자" }}</span>
          &middot;
          <span>{{ toRelTime(flashcard.createdAt) }}</span>
          <template v-if="canDelete">
            &middot;
            <button
              class="cursor-pointer underline disabled:cursor-not-allowed"
              :disabled="deleting"
              @click="deleteFlashcard"
            >
              {{ deleting ? "삭제중..." : "삭제" }}
            </button>
          </template>
          <template v-if="user">
            &middot;
            <UButton
              size="xs"
              :color="data?.isBookmarked ? 'primary' : 'neutral'"
              :variant="data?.isBookmarked ? 'solid' : 'outline'"
              :icon="
                data?.isBookmarked
                  ? 'i-heroicons-bookmark-solid'
                  : 'i-heroicons-bookmark'
              "
              :loading="pending"
              :disabled="pending || waitingForBookmark"
              @click="toggleBookmark"
            >
              {{ flashcard?.bookmarkCount ?? 0 }}
            </UButton>
          </template>
          <template v-else>
            &middot;
            <span>북마크 {{ flashcard.bookmarkCount ?? 0 }}개</span>
          </template>
        </div>
      </div>

      <!-- 플래시카드 -->
      <div
        v-if="flashcard"
        class="flex-1 w-full flex flex-col items-center justify-center px-0 sm:px-4"
      >
        <div
          class="w-full max-w-2xl aspect-[3/2] bg-white dark:bg-black rounded-xl p-8 flex items-center justify-center cursor-pointer border-1 border-gray-300/70 dark:border-gray-600/70"
          @click="flipCard"
        >
          <div class="text-center select-none">
            <div v-if="showFront" class="text-2xl font-bold">
              {{ currentCard?.front ?? "" }}
            </div>
            <div v-else class="text-xl">{{ currentCard?.back ?? "" }}</div>
          </div>
        </div>

        <div class="flex justify-center items-center mt-4 gap-4">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-material-symbols-chevron-left"
            :disabled="currentCardIndex === 0"
            @click="prevCard"
          />
          <span class="text-sm opacity-70">
            {{ currentCardIndex + 1 }} / {{ shuffledCards.length }}
          </span>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-material-symbols-chevron-right"
            :disabled="currentCardIndex >= shuffledCards.length - 1"
            @click="nextCard"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const flashcardId = route.params.id as string;

const { data, pending, error } = await useFetch(
  `/api/flashcards/${flashcardId}` as "/api/flashcards/[id]",
  { key: `flashcard-${flashcardId}` }
);

const flashcard = computed(() => data.value?.flashcard);

// SEO
useSeoMeta({
  title: computed(() =>
    flashcard.value ? `${flashcard.value.title} | 플래시카드` : "플래시카드"
  ),
  description: computed(
    () => `${flashcard.value?.title ?? "플래시카드"}로 학습해보자!`
  ),
  robots: "all",
});

const currentCardIndex = ref(0);
const showFront = ref(true);
const deleting = ref(false);

const { user } = useUserSession();
const toast = useToast();

const canDelete = computed(() => {
  return (
    user.value &&
    flashcard.value &&
    user.value.id === flashcard.value.author?.id
  );
});

const shuffledCards = computed(() => {
  if (!flashcard.value?.cards) return [];
  return [...flashcard.value.cards];
});

const currentCard = computed(() => {
  return shuffledCards.value[currentCardIndex.value];
});

function flipCard() {
  showFront.value = !showFront.value;
}

function prevCard() {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--;
    showFront.value = true;
  }
}

function nextCard() {
  if (currentCardIndex.value < shuffledCards.value.length - 1) {
    currentCardIndex.value++;
    showFront.value = true;
  }
}

async function deleteFlashcard() {
  if (!confirm("정말로 이 플래시카드를 삭제하시겠습니까?")) {
    return;
  }

  try {
    deleting.value = true;

    await $fetch(`/api/flashcards/${flashcardId}`, {
      method: "DELETE",
    });

    toast.add({
      title: "플래시카드 삭제 완료",
      description: "플래시카드가 성공적으로 삭제되었습니다.",
      color: "success",
      duration: 3000,
    });

    await navigateTo("/");
  } catch (err) {
    const error = err as { data?: { message?: string }; message?: string };
    const errorMessage =
      error?.data?.message ??
      error?.message ??
      "플래시카드 삭제 중 오류가 발생했습니다.";

    toast.add({
      title: "플래시카드 삭제 실패",
      description: errorMessage,
      color: "error",
      duration: 5000,
    });
  } finally {
    deleting.value = false;
  }
}

const waitingForBookmark = ref(false);

async function toggleBookmark() {
  if (waitingForBookmark.value) return; // 중복 클릭 방지
  waitingForBookmark.value = true;

  try {
    const result = await $fetch(`/api/flashcards/${flashcardId}/bookmark`, {
      method: "POST",
    });

    // 응답 데이터로 UI 업데이트 (refresh 대신)
    if (data.value) {
      data.value.isBookmarked = result.isBookmarked;
      if (data.value.flashcard) {
        data.value.flashcard.bookmarkCount = result.bookmarkCount;
      }
    }
  } catch (err) {
    const error = err as { data?: { message?: string }; message?: string };
    const errorMessage =
      error?.data?.message ??
      error?.message ??
      "북마크 처리 중 오류가 발생했습니다.";

    toast.add({
      title: "북마크 실패",
      description: errorMessage,
      color: "error",
      duration: 3000,
    });
  } finally {
    waitingForBookmark.value = false;
  }
}
</script>
