<template>
  <NuxtPage />
</template>

<script setup lang="ts">
// 이미 로그인된 사용자는 auth 페이지에 접근할 수 없음
const { loggedIn } = useUserSession();

if (loggedIn.value) {
  throw createError({
    statusCode: 403,
    statusMessage: "이미 로그인되어 있습니다.",
  });
}

useSeoMeta({
  title: "로그인 | 플래시카드",
  description: "로그인",
  robots: "noindex, nofollow",
});
</script>
