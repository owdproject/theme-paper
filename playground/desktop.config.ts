import { defineDesktopConfig } from '@owdproject/core'

export default defineDesktopConfig({
  theme: '@owdproject/theme-paper',
  apps: [
    '@owdproject/app-classic-audioplayer',
    '@owdproject/app-gridsky',
    '@owdproject/app-wasmboy',
    '@owdproject/app-terminal',
    '@owdproject/app-youtube',
    '@owdproject/app-soundcloud',
    '@owdproject/app-todo',
  ],
  terminal: {
    welcomeMessage: 'Paper Desktop',
    prompt: '$',
  },
})
