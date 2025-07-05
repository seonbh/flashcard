// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: false },

  css: ["~/assets/css/main.css"],

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/ui",
    "nuxt-auth-utils",
  ],
  runtimeConfig: {
    mongodbUri: process.env.NUXT_MONGODB_URI,
  },
  app: {
    head: {
      title: "플래시카드 | 플래시카드로 학습하자",
      meta: [
        { name: "robots", content: "noindex, nofollow" },
        {
          name: "description",
          content: "다양한 플래시카드로 효과적인 학습을 시작해보세요!",
        },
      ],
    },
  },
});
