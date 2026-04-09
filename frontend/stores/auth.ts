import { defineStore } from "pinia";

interface User {
  id: string;
  email: string;
  name: string;
  affiliation: string | null;
  role: "author" | "reviewer" | "admin";
}

interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "admin",
    isReviewer: (state) =>
      state.user?.role === "reviewer" || state.user?.role === "admin",
    isAuthor: (state) =>
      state.user?.role === "author" || state.user?.role === "admin",
  },

  actions: {
    setAuth(token: string, user: User) {
      this.token = token;
      this.user = user;
      if (import.meta.client) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      if (import.meta.client) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      navigateTo("/auth/login");
    },

    loadFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (token && userStr) {
          this.token = token;
          this.user = JSON.parse(userStr);
        }
      }
    },
  },
});
