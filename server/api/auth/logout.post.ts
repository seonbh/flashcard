export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  
  return {
    success: true,
    message: "로그아웃되었습니다."
  }
})