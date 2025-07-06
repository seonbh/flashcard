<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- 헤더 -->
    <div class="flex justify-between items-center mb-5 gap-3">
      <UInput
        v-model="searchQuery"
        placeholder="플래시카드 검색..."
        size="lg"
        class="flex-1 max-w-xs"
        type="search"
        @keyup.enter="refresh"
      />
      <UButton size="lg" :to="user ? '/new' : '/auth/signup'" variant="soft">
        플래시카드 만들기
      </UButton>
    </div>

    <!-- 플래시카드 리스트 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <NuxtLink
        v-for="flashcard in data?.flashcards"
        :key="flashcard._id"
        class="border-1 border-gray-300/70 dark:border-gray-700/70 rounded-lg cursor-pointer hover:border-gray-300/90 dark:hover:border-gray-700/90 overflow-hidden"
        :to="`/${flashcard._id}`"
      >
        <!-- 랜덤 카드 미리보기 -->
        <div
          class="aspect-[3/2] bg-white dark:bg-black border-b-1 border-gray-300/70 dark:border-gray-600/70 flex items-center justify-center p-4"
        >
          <div class="text-center">
            <div class="text-lg font-bold">
              {{ flashcard.firstCardFront }}
            </div>
          </div>
        </div>

        <!-- 플래시카드 정보 -->
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-1 truncate">
            {{ flashcard.title }}
          </h3>
          <div class="flex items-center gap-1 text-sm opacity-70">
            <span>by {{ flashcard.author?.name ?? "알 수 없는 사용자" }}</span>
            &middot;
            <div class="flex items-center gap-1">
              <UIcon name="i-heroicons-rectangle-stack" class="w-3 h-3" />
              <span>{{ flashcard.cardCount ?? 0 }}</span>
            </div>
            &middot;
            <div class="flex items-center gap-1">
              <UIcon
                :name="
                  flashcard.isBookmarked
                    ? 'i-heroicons-bookmark-solid'
                    : 'i-heroicons-bookmark'
                "
                class="w-3 h-3"
                :class="flashcard.isBookmarked ? 'text-primary' : ''"
              />
              <span>{{ flashcard.bookmarkCount ?? 0 }}</span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="pending" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-1 border-primary/30 dark:border-primary/50 mx-auto"
      />
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="!data?.flashcards?.length" class="text-center py-12">
      <p class="text-lg opacity-70">아직 플래시카드가 없습니다.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "플래시카드 | 플래시카드로 학습하자",
  description: "다양한 플래시카드로 효과적인 학습을 시작해보세요!",
  robots: "all",
});

const { user } = useUserSession();

const searchQuery = ref("");
const debouncedQuery = refDebounced(searchQuery, 400);

const { data, pending, refresh } = await useFetch("/api/flashcards", {
  key: "flashcard-list",
  query: { search: debouncedQuery },
});
</script>
