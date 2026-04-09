export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@pinia/nuxt"],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3001/envicon2026/api",
    },
  },

  app: {
    baseURL: "/envicon2026",
    head: {
      title: "ENVICON 2026 — การประชุมวิชาการระดับชาติ ครั้งที่ 5",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "การประชุมวิชาการระดับชาติ ครั้งที่ 5 สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย — Innovative Environmental Technologies for a Sustainable and Low-Carbon Future",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/envicon2026/favicon.ico",
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap",
        },
      ],
    },
  },

  vite: {
    css: {
      preprocessorOptions: {},
    },
  },
});
