export const useAuth = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    affiliation?: string;
  }) => {
    const res = await $fetch<{ token: string; user: any }>(
      `${apiBase}/auth/register`,
      {
        method: "POST",
        body: data,
      }
    );
    authStore.setAuth(res.token, res.user);
    return res;
  };

  const login = async (email: string, password: string) => {
    const res = await $fetch<{ token: string; user: any }>(
      `${apiBase}/auth/login`,
      {
        method: "POST",
        body: { email, password },
      }
    );
    authStore.setAuth(res.token, res.user);
    return res;
  };

  const fetchMe = async () => {
    if (!authStore.token) return null;
    try {
      const res = await $fetch<{ user: any }>(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      authStore.user = res.user;
      return res.user;
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
