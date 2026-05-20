export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  authStore.loadFromStorage();

  if (!authStore.isLoggedIn) {
    return navigateTo("/auth/login");
  }
});
