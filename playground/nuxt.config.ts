export default defineNuxtConfig({
  workspaceDir: '../../../',

  modules: ['@owdproject/core'],

  ssr: false,

  devtools: { enabled: true },

  compatibilityDate: '2025-05-15',

  experimental: {
    viteEnvironmentApi: true,
  },
})
