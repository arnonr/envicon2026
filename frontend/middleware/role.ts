export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  authStore.loadFromStorage();

  const path = to.path;

  if (path === "/dashboard" && authStore.isAdmin) {
    return navigateTo("/admin");
  }

  if (path.startsWith("/admin") && !authStore.isAdmin) {
    return navigateTo("/");
  }

  if (path.startsWith("/reviewer") && !authStore.isReviewer) {
    return navigateTo("/");
  }
});
