import { defineDesktopConfig } from '@owdproject/core'

export default defineDesktopConfig({
  theme: '@owdproject/theme-paper',
  modules: ['@owdproject/module-fs', '@owdproject/module-persistence'],
  apps: [
    '@owdproject/app-dino',
    '@owdproject/app-gridsky',
    '@owdproject/app-terminal',
    '@owdproject/app-youtube',
    '@owdproject/app-soundcloud',
    '@owdproject/app-todo',
  ],
  fs: {
    mounts: {
      '/mnt/test': '/test-small.zip',
    },
  },
  terminal: {
    welcomeMessage: 'Paper Desktop',
    prompt: '$',
  },
})
