<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b-1 border-gray-300/70 dark:border-gray-700/70">
      <div class="max-w-4xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- 왼쪽: 로고 -->
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold">플래시카드ㅎㅎㅎㅎ.</NuxtLink>
          </div>

          <!-- 오른쪽: 사용자 메뉴 -->
          <div class="flex items-center space-x-4">
            <div v-if="loggedIn" class="flex items-center space-x-2">
              <NuxtLink to="/me" class="text-sm">{{ user.name }}님</NuxtLink>
              <UButton
                variant="ghost"
                size="sm"
                :loading="logoutPending"
                @click="logout"
              >
                로그아웃
              </UButton>
            </div>
            <div v-else class="flex items-center space-x-2">
              <UButton variant="ghost" size="sm" to="/auth/login">
                로그인
              </UButton>
              <UButton variant="outline" size="sm" to="/auth/signup">
                회원가입
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer
      class="border-t-1 border-gray-300/70 dark:border-gray-700/70 py-6 mt-12"
    >
      <div class="max-w-4xl mx-auto px-4">
        <div
          class="flex flex-col items-center space-y-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <div class="flex items-center space-x-2">
            <NuxtLink
              to="/terms"
              class="hover:text-gray-900 dark:hover:text-gray-200"
            >
              이용약관
            </NuxtLink>
            <span>&middot;</span>
            <NuxtLink
              to="/privacy"
              class="hover:text-gray-900 dark:hover:text-gray-200"
            >
              개인정보처리방침
            </NuxtLink>
          </div>
          <div>&copy; 2025 Nontick Inc.</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession();
const toast = useToast();

const logoutPending = ref(false);

async function logout() {
  try {
    logoutPending.value = true;

    await $fetch("/api/auth/logout", {
      method: "POST",
    });

    await clear();

    toast.add({
      title: "로그아웃 완료",
      description: "성공적으로 로그아웃되었습니다.",
      color: "success",
      duration: 3000,
    });

    await navigateTo("/");
  } catch {
    toast.add({
      title: "로그아웃 실패",
      description: "로그아웃 중 오류가 발생했습니다.",
      color: "error",
      duration: 5000,
    });
  } finally {
    logoutPending.value = false;
  }
}
</script>
