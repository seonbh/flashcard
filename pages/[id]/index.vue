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
      <div class="px-4 mb-8">
        <h1 class="text-xl font-bold mb-2">{{ flashcard.title }}</h1>
        <div class="flex items-center gap-2 text-sm opacity-70">
          <span>by {{ flashcard.author?.name ?? "알 수 없는 사용자" }}</span>
          &middot;
          <span>{{ toRelTime(flashcard.createdAt) }}</span>
          <template v-if="canManage">
            &middot;
            <NuxtLink
              :to="`/${flashcardId}/edit`"
              class="cursor-pointer underline"
            >
              수정
            </NuxtLink>
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
        class="flex-1 w-full flex flex-col items-center justify-center px-4"
      >
        <div class="w-full max-w-2xl relative">
          <div
            class="w-full aspect-[3/2] bg-white dark:bg-black rounded-xl p-8 flex items-center justify-center cursor-pointer border-1 border-gray-300/70 dark:border-gray-600/70"
            @click="flipCard"
          >
            <div class="text-center select-none">
              <div
                v-if="
                  (showFront && !reverseMode) || (!showFront && reverseMode)
                "
                class="text-2xl font-bold"
              >
                {{ currentCard?.front }}
              </div>
              <div v-else class="text-xl">
                {{ currentCard?.back }}
              </div>
            </div>
          </div>

          <!-- 진행도 -->
          <div
            class="absolute top-4 left-0 right-0 text-sm opacity-70 pointer-events-none text-center select-none"
          >
            {{ currentCardIndex + 1 }} / {{ shuffledCards.length }}
          </div>

          <!-- 왼쪽 화살표 -->
          <div class="absolute left-0 top-0 bottom-0 flex items-center">
            <button
              :disabled="currentCardIndex === 0"
              class="h-full pl-2 pr-5 opacity-50 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
              @click="prevCard"
            >
              <UIcon name="i-material-symbols-chevron-left" size="30" />
            </button>
          </div>

          <!-- 오른쪽 화살표 -->
          <div class="absolute right-0 top-0 bottom-0 flex items-center">
            <button
              :disabled="currentCardIndex >= shuffledCards.length - 1"
              class="h-full pr-2 pl-5 opacity-50 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
              @click="nextCard"
            >
              <UIcon name="i-material-symbols-chevron-right" size="30" />
            </button>
          </div>
        </div>

        <div class="flex justify-center mt-4 gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-material-symbols-refresh"
            @click="resetAndShuffle"
          >
            처음부터
          </UButton>
          <UButton
            :color="reverseMode ? 'primary' : 'neutral'"
            variant="ghost"
            size="sm"
            icon="i-material-symbols-flip-to-back"
            @click="toggleMode"
          >
            뒷면보고 맞추기
          </UButton>
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

function* prng(init: number) {
  let x = Math.floor(init * 2147483647) || 1;
  while (true) {
    x = (x * 16807) % 2147483647;
    yield x / 2147483647;
  }
}

const seed = useState<number>(`flashcard-seed-${flashcardId}`, () =>
  Math.random()
);

function shuffleWithSeed<T>(list: T[], s: number): T[] {
  const out = [...list];
  const rand = prng(s);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand.next().value! * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const shuffledCards = ref<{ front: string; back: string }[]>([]);

function shuffleCards() {
  if (!flashcard.value) return;
  shuffledCards.value = shuffleWithSeed(flashcard.value.cards, seed.value);
}

shuffleCards();

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
const reverseMode = ref(false);

const { user } = useUserSession();
const toast = useToast();

const canManage = computed(() => {
  return (
    user.value &&
    flashcard.value &&
    user.value.id === flashcard.value.author?.id
  );
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

function resetAndShuffle() {
  if (flashcard.value?.cards) {
    seed.value = Math.random(); // 새 시드
    shuffleCards();
    currentCardIndex.value = 0;
    showFront.value = true;
  }
}

function toggleMode() {
  reverseMode.value = !reverseMode.value;
  showFront.value = true;
}
</script>
