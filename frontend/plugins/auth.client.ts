export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  if (!authStore.initialized) {
    authStore.loadFromStorage();
  }
});
