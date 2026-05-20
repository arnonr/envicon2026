export const useAuth = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    affiliation?: string;
    phone?: string;
  }) => {
    const res = await $fetch<{
      success: boolean;
      data: { token: string; user: any };
    }>(`${apiBase}/auth/register`, {
      method: "POST",
      body: data,
    });
    authStore.setAuth(res.data.token, res.data.user);
    return res.data;
  };

  const login = async (email: string, password: string) => {
    const res = await $fetch<{
      success: boolean;
      data: { token: string; user: any };
    }>(`${apiBase}/auth/login`, {
      method: "POST",
      body: { email, password },
    });
    authStore.setAuth(res.data.token, res.data.user);
    return res.data;
  };

  const fetchMe = async () => {
    if (!authStore.token) return null;
    try {
      const res = await $fetch<{
        success: boolean;
        data: { user: any };
      }>(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      authStore.user = res.data.user;
      return res.data.user;
    } catch {
      authStore.logout();
      return null;
    }
  };

  return {
    register,
    login,
    fetchMe,
    logout: () => authStore.logout(),
    user: computed(() => authStore.user),
    isLoggedIn: computed(() => authStore.isLoggedIn),
    isAdmin: computed(() => authStore.isAdmin),
    isReviewer: computed(() => authStore.isReviewer),
  };
};
