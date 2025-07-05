export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    throw createError({
      statusCode: 401,
      message: "로그인이 필요합니다.",
    });
  }
});
