export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  authStore.loadFromStorage();

  if (!authStore.isLoggedIn) {
    return navigateTo("/auth/login");
  }
});
