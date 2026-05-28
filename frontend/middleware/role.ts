export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  authStore.loadFromStorage();

  const baseURL = useRuntimeConfig().app.baseURL.replace(/\/$/, "");
  const path = baseURL && to.path.startsWith(baseURL)
    ? to.path.slice(baseURL.length) || "/"
    : to.path;

  const isAuthorPage =
    path === "/dashboard" ||
    path === "/submit" ||
    path.startsWith("/submissions");

  if (isAuthorPage && !authStore.isAuthor) {
    if (authStore.isAdmin) return navigateTo("/admin");
    if (authStore.isReviewer) return navigateTo("/reviewer");
    return navigateTo("/");
  }

  if (path.startsWith("/admin") && !authStore.isAdmin) {
    return navigateTo("/");
  }

  if (path.startsWith("/reviewer") && !authStore.isReviewer) {
    return navigateTo("/");
  }
});
